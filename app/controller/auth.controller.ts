/**
 * @description holds auth controller
 */

import {
  AccountVerificationMailActionParams,
  ForgetPasswordMailActionParams,
  HttpError,
  MailActionType,
  MessageQueueChannelType,
  MessageQueueProvider,
  MongoDbProvider,
  PostgreSqlProvider,
  QueueMessage,
  ResponseCode,
  TokenUtil,
  User,
  UserRole,
} from '@open-template-hub/common';
import bcrypt from 'bcrypt';
import { Environment } from '../../environment';
import { TwoFactorCode } from '../interface/two-factor-code.interface';
import { TokenRepository } from '../repository/token.repository';
import { UserRepository } from '../repository/user.repository';
import { TeamController } from './team.controller';
import { TwoFactorCodeController } from './two-factor.controller';

export class AuthController {

  environment: Environment;
  tokenUtil: TokenUtil;

  constructor() {
    this.environment = new Environment();
    this.tokenUtil = new TokenUtil( this.environment.args() );
  }

  /**
   * sign up user
   * @param db database
   * @param message_queue_provider message queue
   * @param user user
   * @param languageCode
   */
  signup = async (
      db: PostgreSqlProvider,
      mongodb_provider: MongoDbProvider,
      message_queue_provider: MessageQueueProvider,
      origin: string,
      user: User,
      languageCode?: string
  ) => {
    if ( !user.password || !user.username || !user.email ) {
      let e = new Error( 'username, password and email required' ) as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      console.error( e );
      throw e;
    }

    const hashedPassword = await bcrypt.hash( user.password, 10 );
    const userRepository = new UserRepository( db );

    await userRepository.insertUser( {
      username: user.username,
      password: hashedPassword,
      role: UserRole.DEFAULT,
      email: user.email,
    } as User );

    const tokenUtil = new TokenUtil( this.environment.args() );
    const verificationToken = tokenUtil.generateVerificationToken( user );

    const isAutoVerify = process.env.AUTO_VERIFY === 'true';

    if ( isAutoVerify ) {
      await this.verify( db, verificationToken );
      return this.login(db, mongodb_provider, message_queue_provider, origin, user)
    } else {
      const orchestrationChannelTag =
          this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;
      const verificationParams = {
        user: user.username,
        email: user.email,
        accountVerificationToken: verificationToken,
        clientVerificationSuccessUrl:
        this.environment.args().extendedArgs?.clientVerificationSuccessUrl,
      } as AccountVerificationMailActionParams;
      const message = {
        sender: MessageQueueChannelType.AUTH,
        receiver: MessageQueueChannelType.MAIL,
        message: {
          mailType: {
            verifyAccount: {
              params: verificationParams,
            },
          },
          language: languageCode,
        } as MailActionType,
      } as QueueMessage;
      await message_queue_provider.publish(
          message,
          orchestrationChannelTag as string
      );
      return { email: user.email };
    }
  };

  /**
   * login user
   * @param db database
   * @param user user
   */
  login = async (
      db: PostgreSqlProvider,
      mongoDbProvider: MongoDbProvider,
      messageQueueProvider: MessageQueueProvider,
      origin: string,
      user: User,
      skipTwoFactorControl: boolean = false
  ) => {
    if ( !( user.username || user.email ) ) {
      let e = new Error( 'username or email required' ) as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    if ( !user.password ) {
      let e = new Error( 'password required' ) as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    const userRepository = new UserRepository( db );

    const username = user.username || user.email;

    let dbUser = await userRepository.findUserByUsernameOrEmail( username );

    // if user is not admin and origin is related with admin clients, do not permit to process
    if ( dbUser?.role && dbUser.role !== UserRole.ADMIN && process.env.ADMIN_CLIENT_URLS?.includes( origin ) ) {
      let e = new Error( 'Bad Credentials' ) as HttpError;
      e.responseCode = ResponseCode.FORBIDDEN;
      throw e;
    }

    if ( !( await bcrypt.compare( user.password, dbUser.password ) ) ) {
      let e = new Error( 'Bad credentials' ) as HttpError;
      e.responseCode = ResponseCode.FORBIDDEN;
      throw e;
    }

    if ( !dbUser.verified ) {
      let e = new Error( 'Account not verified' ) as HttpError;
      e.responseCode = ResponseCode.FORBIDDEN;
      throw e;
    }

    if ( !skipTwoFactorControl && dbUser.two_factor_enabled ) {
      const environment = new Environment();
      const tokenUtil = new TokenUtil( environment.args() );
      const twoFactorCodeController = new TwoFactorCodeController();

      const preAuthToken = tokenUtil.generatePreAuthToken( user );

      const twoFactorCode = {
        username: dbUser.username,
        phoneNumber: dbUser.phone_number,
      } as TwoFactorCode;

      const twoFactorRequestResponse = await twoFactorCodeController.request(
          db,
          messageQueueProvider,
          twoFactorCode
      );

      return {
        preAuthToken,
        expiry: twoFactorRequestResponse.expire,
        maskedPhoneNumber: this.maskPhoneNumber( dbUser.phone_number ),
      };
    } else {
      const tokenRepository = new TokenRepository( db );

      const userTeams: any[] = await TeamController.getTeams(mongoDbProvider, user.username);

      let userTeamIDs: string[] = []

      if(userTeams) {
        for(const userTeam of userTeams) {
          userTeamIDs.push(userTeam._id);
        }
      }
      user.teamIDs = userTeamIDs;

      const genereateTokenResponse = await tokenRepository.generateTokens(
          dbUser,
      );
      return {
        accessToken: genereateTokenResponse.accessToken,
        refreshToken: genereateTokenResponse.refreshToken,
      };
    }
  };

  twoFactorVerifiedLogin = async ( db: PostgreSqlProvider, user: any ) => {
    const tokenRepository = new TokenRepository( db );
    const genereateTokenResponse = await tokenRepository.generateTokens( user );
    return {
      accessToken: genereateTokenResponse.accessToken,
      refreshToken: genereateTokenResponse.refreshToken,
    };
  };

  /**
   * logout user
   * @param db database
   * @param token token
   */
  logout = async ( db: PostgreSqlProvider, token: string ) => {
    const tokenRepository = new TokenRepository( db );
    await tokenRepository.deleteToken( token );
  };

  /**
   * generates and returns new access token
   * @param db database
   * @param token token
   */
  token = async ( db: PostgreSqlProvider, token: string ) => {
    const tokenRepository = new TokenRepository( db );
    await tokenRepository.findToken( token );
    const user: any = this.tokenUtil.verifyRefreshToken( token );
    return this.tokenUtil.generateAccessToken( user );
  };

  /**
   * verifies token
   * @param db database
   * @param token token
   */
  verify = async (
      db: PostgreSqlProvider,
      token: string,
  ) => {
    const user: any = this.tokenUtil.verifyVerificationToken( token );

    const userRepository = new UserRepository( db );
    await userRepository.verifyUser( user.username );
  };

  /**
   * sends password reset mail
   * @param db database
   * @param message_queue_provider
   * @param username username
   * @param languageCode language code
   * @param sendEmail don't send email if false
   */
  forgetPassword = async (
      db: PostgreSqlProvider,
      message_queue_provider: MessageQueueProvider,
      username: string,
      languageCode?: string,
      sendEmail: boolean = true
  ) => {
    const userRepository = new UserRepository( db );
    const user = await userRepository.findEmailAndPasswordByUsername( username );
    const passwordResetToken = this.tokenUtil.generatePasswordResetToken( user );

    if ( sendEmail ) {
      const orchestrationChannelTag =
          this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;
      const forgetPasswordParams = {
        user: user.username,
        email: user.email,
        passwordResetToken,
        clientResetPasswordUrl:
        this.environment.args().extendedArgs?.clientResetPasswordUrl,
      } as ForgetPasswordMailActionParams;
      const message = {
        sender: MessageQueueChannelType.AUTH,
        receiver: MessageQueueChannelType.MAIL,
        message: {
          mailType: {
            forgetPassword: {
              params: forgetPasswordParams,
            },
          },
          language: languageCode,
        } as MailActionType,
      } as QueueMessage;
      await message_queue_provider.publish(
          message,
          orchestrationChannelTag as string
      );
    }

    return passwordResetToken;
  };

  /**
   * verifies password reset token and resets password
   * @param db database
   * @param user user
   * @param token token
   */
  resetPassword = async ( db: PostgreSqlProvider, user: User, token: string ) => {
    if ( !user.password || !user.username ) {
      let e = new Error( 'username and password required' ) as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    user.password = await bcrypt.hash( user.password, 10 );

    const userRepository = new UserRepository( db );
    const dbUser = await userRepository.findEmailAndPasswordByUsername(
        user.username
    );

    this.tokenUtil.verifyPasswordResetToken( token, dbUser.password );
    await userRepository.updateByUsername( user );
  };

  /**
   * delete user
   * @param db database
   * @param currentUser current user
   * @param user user
   */
  deleteUser = async (
      db: PostgreSqlProvider,
      currentUser: string,
      user: User
  ) => {
    if ( !user.username ) {
      let e = new Error( 'username required' ) as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    } else if ( currentUser === user.username ) {
      let e = new Error( 'you cannot delete yourself' ) as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    const userRepository = new UserRepository( db );

    await userRepository.deleteUserByUsername( user.username );
  };

  getSubmittedPhoneNumber = async (
      db: PostgreSqlProvider,
      username: string
  ) => {
    const userRepository = new UserRepository( db );
    const phoneNumberResponse =
        await userRepository.findVerifiedPhoneNumberByUsername( username );

    let phoneNumber;
    if (
        phoneNumberResponse?.length > 0 &&
        phoneNumberResponse[ 0 ].phone_number
    ) {
      phoneNumber = this.maskPhoneNumber( phoneNumberResponse[ 0 ].phone_number );
    }

    return phoneNumber;
  };

  deleteSubmittedPhoneNumber = async (
      db: PostgreSqlProvider,
      username: string
  ) => {
    const userRepository = new UserRepository( db );

    await userRepository.deletedSubmittedPhoneNumberByUsername( username );
  };

  private maskPhoneNumber( number: string ): string {
    let maskedNumber = '';
    for ( let i = 0; i < number.length; i++ ) {
      if ( i > number.length - 3 ) {
        maskedNumber += number.charAt( i );
      } else {
        maskedNumber += '*';
      }
    }
    return maskedNumber;
  }

  getUsers = async (
      db: PostgreSqlProvider,
      role?: string,
      verified?: any,
      oauth?: any,
      twoFA?: any,
      username?: string,
      offset?: number,
      limit?: number
  ) => {
    const userRepository = new UserRepository( db );

    if ( role === 'All' ) {
      role = '';
    }

    if ( verified === 'true' ) {
      verified = true;
    } else if ( verified === 'false' ) {
      verified = false;
    }

    if ( twoFA === 'true' ) {
      twoFA = true;
    } else if ( twoFA === 'false' ) {
      twoFA = false;
    }

    if ( !offset ) {
      offset = 0;
    }

    if ( !limit ) {
      limit = 20;
    }

    let users: any[] = [];
    let count: any;

    users = await userRepository.getAllUsers( role ?? '', verified, twoFA, oauth, username ?? '', offset, limit );
    count = +( await userRepository.getAllUsersCount( role ?? '', verified, twoFA, oauth, username ?? '' ) ).count ?? 0;

    return { users, meta: { offset, limit, count } };
  };
}

