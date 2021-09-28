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
  PostgreSqlProvider,
  QueueMessage,
  ResponseCode,
  TokenUtil,
  User,
} from '@open-template-hub/common';
import bcrypt from 'bcrypt';
import { Environment } from '../../environment';
import { TokenRepository } from '../repository/token.repository';
import { UserRepository } from '../repository/user.repository';

export class AuthController {
  constructor(
    private environment = new Environment(),
    private tokenUtil: TokenUtil = new TokenUtil(environment.args())
  ) {}

  /**
   * sign up user
   * @param db database
   * @param user user
   */
  signup = async (
    db: PostgreSqlProvider,
    message_queue_provider: MessageQueueProvider,
    user: User
  ) => {
    if (!user.password || !user.username || !user.email) {
      let e = new Error('username, password and email required') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      console.error(e);
      throw e;
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userRepository = new UserRepository(db);

    await userRepository.insertUser({
      username: user.username,
      password: hashedPassword,
      email: user.email,
    } as User);

    const tokenUtil = new TokenUtil(this.environment.args());
    const verificationToken = tokenUtil.generateVerificationToken(user);

    const isAutoVerify = process.env.AUTO_VERIFY === 'true';

    if (isAutoVerify) {
      await this.verify(db, verificationToken);
      return this.login(db, user);
    } else {
      var orchestrationChannelTag =
        this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;
      var verificationParams = {
        user: user.username,
        email: user.email,
        accountVerificationToken: verificationToken,
        clientVerificationSuccessUrl:
          this.environment.args().extentedArgs?.clientVerificationSuccessUrl,
      } as AccountVerificationMailActionParams;
      var message = {
        sender: MessageQueueChannelType.AUTH,
        receiver: MessageQueueChannelType.MAIL,
        message: {
          verifyAccount: {
            params: verificationParams,
          },
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
  login = async (db: PostgreSqlProvider, user: User) => {
    if (!(user.username || user.email)) {
      let e = new Error('username or email required') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    if (!user.password) {
      let e = new Error('password required') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    const userRepository = new UserRepository(db);

    const username = user.username || user.email;

    let dbUser = await userRepository.findUserByUsernameOrEmail(username);

    if (!(await bcrypt.compare(user.password, dbUser.password))) {
      let e = new Error('Bad credentials') as HttpError;
      e.responseCode = ResponseCode.FORBIDDEN;
      throw e;
    }

    if (!dbUser.verified) {
      let e = new Error('Account not verified') as HttpError;
      e.responseCode = ResponseCode.FORBIDDEN;
      throw e;
    }

    const tokenRepository = new TokenRepository(db);
    return tokenRepository.generateTokens(dbUser);
  };

  /**
   * logout user
   * @param db database
   * @param token token
   */
  logout = async (db: PostgreSqlProvider, token: string) => {
    const tokenRepository = new TokenRepository(db);
    await tokenRepository.deleteToken(token);
  };

  /**
   * generates and returns new access token
   * @param db database
   * @param token token
   */
  token = async (db: PostgreSqlProvider, token: string) => {
    const tokenRepository = new TokenRepository(db);
    await tokenRepository.findToken(token);
    const user: any = this.tokenUtil.verifyRefreshToken(token);
    return this.tokenUtil.generateAccessToken(user);
  };

  /**
   * verifies token
   * @param db database
   * @param token token
   */
  verify = async (db: PostgreSqlProvider, token: string) => {
    const user: any = this.tokenUtil.verifyVerificationToken(token);

    const userRepository = new UserRepository(db);
    await userRepository.verifyUser(user.username);
  };

  /**
   * sends password reset mail
   * @param db database
   * @param username username
   * @param sendEmail don't send email if false
   */
  forgetPassword = async (
    db: PostgreSqlProvider,
    message_queue_provider: MessageQueueProvider,
    username: string,
    sendEmail: boolean = true
  ) => {
    const userRepository = new UserRepository(db);
    const user = await userRepository.findEmailAndPasswordByUsername(username);
    const passwordResetToken = this.tokenUtil.generatePasswordResetToken(user);

    if (sendEmail) {
      var orchestrationChannelTag =
        this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;
      var forgetPasswordParams = {
        user: user.username,
        email: user.email,
        passwordResetToken,
        clientResetPasswordUrl:
          this.environment.args().extentedArgs?.clientResetPasswordUrl,
      } as ForgetPasswordMailActionParams;
      var message = {
        sender: MessageQueueChannelType.AUTH,
        receiver: MessageQueueChannelType.MAIL,
        message: {
          forgetPassword: {
            params: forgetPasswordParams,
          },
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
  resetPassword = async (db: PostgreSqlProvider, user: User, token: string) => {
    if (!user.password || !user.username) {
      let e = new Error('username and password required') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    user.password = await bcrypt.hash(user.password, 10);

    const userRepository = new UserRepository(db);
    const dbUser = await userRepository.findEmailAndPasswordByUsername(
      user.username
    );

    this.tokenUtil.verifyPasswordResetToken(token, dbUser.password);
    await userRepository.updateByUsername(user);
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
    if (!user.username) {
      let e = new Error('username required') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    } else if (currentUser === user.username) {
      let e = new Error('you cannot delete yourself') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    const userRepository = new UserRepository(db);

    await userRepository.deleteUserByUsername(user.username);
  };
}
