import bcrypt from 'bcrypt';
import { HttpError } from '../util/http-error.util';
import { TokenUtil } from '../util/token.util';
import {
  MailUtil
} from '../util/mail.util';
import { ResponseCode } from '../constant';
import { TokenRepository } from '../repository/token.repository';
import { UserRepository } from '../repository/user.repository';

export class AuthController {
  private readonly mailUtil: MailUtil;
  private readonly tokenUtil: TokenUtil;

  constructor() {
    this.mailUtil = new MailUtil();
    this.tokenUtil = new TokenUtil();
  }

  signup = async (db, user) => {
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
    });
    const tokenUtil = new TokenUtil();
    const verificationToken = tokenUtil.generateVerificationToken(user);
    
    await this.mailUtil.sendAccountVerificationMail(user, verificationToken);

    return user.email;
  };

  login = async (db, user) => {
    if (!user.password || !user.username) {
      let e = new Error('username and password required') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    const userRepository = new UserRepository(db);
    let dbUser = await userRepository.findUserByUsername(user.username);

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

  logout = async (db, token) => {
    const tokenRepository = new TokenRepository(db);
    await tokenRepository.deleteToken(token);
  };

  token = async (db, token) => {
    const tokenRepository = new TokenRepository(db);
    await tokenRepository.findToken(token);
    const user = await this.tokenUtil.verifyRefreshToken(token);
    return this.tokenUtil.generateAccessToken(user);
  };

  verify = async (db, token) => {
    const user = await this.tokenUtil.verifyVerificationToken(token);

    const userRepository = new UserRepository(db);
    await userRepository.verifyUser(user.username);
  };

  forgetPassword = async (db, username) => {
    const userRepository = new UserRepository(db);
    const user = await userRepository.findEmailAndPasswordByUsername(username);
    const passwordResetToken = this.tokenUtil.generatePasswordResetToken(user);

    await this.mailUtil.sendPasswordResetMail(user, passwordResetToken);
  };

  resetPassword = async (db, user, token) => {
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

    await this.tokenUtil.verifyPasswordResetToken(token, dbUser.password);
    await userRepository.updateByUsername(user);
  };
}
