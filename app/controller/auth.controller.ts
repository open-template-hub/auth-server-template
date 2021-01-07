/**
 * @description holds auth controller
 */

import bcrypt from 'bcrypt';
import { HttpError } from '../interface/http-error.interface';
import {
  TokenUtil,
  ResponseCode,
  PostgreSqlProvider,
  User,
  MailUtil,
} from '@open-template-hub/common';
import { TokenRepository } from '../repository/token.repository';
import { UserRepository } from '../repository/user.repository';
import { Environment } from '../../environment';

export class AuthController {
  constructor(
    private environment = new Environment(),
    private mailUtil: MailUtil = new MailUtil(environment.args()),
    private tokenUtil: TokenUtil = new TokenUtil(environment.args())
  ) {}

  /**
   * sign up user
   * @param db database
   * @param user user
   */
  signup = async (db: PostgreSqlProvider, user: User) => {
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
      return await this.login(db, user);
    } else {
      await this.mailUtil.sendAccountVerificationMail(user, verificationToken);
      return { email: user.email, verificationToken };
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
    return await tokenRepository.generateTokens(dbUser);
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
    const user = this.tokenUtil.verifyRefreshToken(token) as User;
    return this.tokenUtil.generateAccessToken(user);
  };

  /**
   * verifies token
   * @param db database
   * @param token token
   */
  verify = async (db: PostgreSqlProvider, token: string) => {
    const user = this.tokenUtil.verifyVerificationToken(token) as User;

    const userRepository = new UserRepository(db);
    await userRepository.verifyUser(user.username);
  };

  /**
   * sends password reset mail
   * @param db database
   * @param username username
   */
  forgetPassword = async (db: PostgreSqlProvider, username: string) => {
    const userRepository = new UserRepository(db);
    const user = await userRepository.findEmailAndPasswordByUsername(username);
    const passwordResetToken = this.tokenUtil.generatePasswordResetToken(user);

    await this.mailUtil.sendPasswordResetMail(user, passwordResetToken);
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
}
