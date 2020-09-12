import bcrypt from 'bcrypt';
import { HttpError } from '../util/httpError';
import {
 findEmailAndPasswordByUsername,
 findUserByUsername,
 insertUser,
 updateByUsername,
 verifyUser
} from '../dao/userDao';
import {
 generateAccessToken,
 generatePasswordResetToken,
 generateRefreshToken,
 generateVerificationToken,
 verifyPasswordResetToken,
 verifyRefreshToken,
 verifyVerificationToken
} from './tokenService';
import { sendAccountVerificationMail, sendPasswordResetMail } from './mailService';
import { deleteToken, findToken, insertToken } from '../dao/tokenDao';
import { ResponseCode } from '../util/constant';

export class AuthService {
 signup = async (db, user) => {
  if (!user.password || !user.username || !user.email) {
   let e = new Error('username, password and email required') as HttpError;
   e.responseCode = ResponseCode.BAD_REQUEST;
   console.error(e);
   throw e;
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);
  await insertUser(db, {username: user.username, password: hashedPassword, email: user.email});

  const verificationToken = generateVerificationToken(user);
  await sendAccountVerificationMail(user, verificationToken);
 }

 login = async (db, user) => {
  if (!user.password || !user.username) {
   let e = new Error('username and password required') as HttpError;
   e.responseCode = ResponseCode.BAD_REQUEST;
   throw e;
  }

  let dbUser = await findUserByUsername(db, user.username);

  if (!await bcrypt.compare(user.password, dbUser.password)) {
   let e = new Error('Bad credentials') as HttpError;
   e.responseCode = ResponseCode.FORBIDDEN;
   throw e;
  }

  if (!dbUser.verified) {
   let e = new Error('Account not verified') as HttpError;
   e.responseCode = ResponseCode.FORBIDDEN;
   throw e;
  }

  return await this.generateTokens(db, dbUser);
 }

 logout = async (db, token) => {
  await deleteToken(db, token);
 }

 token = async (db, token) => {
  await findToken(db, token);
  const user = await verifyRefreshToken(token);
  return generateAccessToken(user);
 }

 verify = async (db, token) => {
  const user = await verifyVerificationToken(token);
  await verifyUser(db, user.username);
 }

 forgetPassword = async (db, username) => {
  const user = await findEmailAndPasswordByUsername(db, username);
  const passwordResetToken = generatePasswordResetToken(user);
  await sendPasswordResetMail(user, passwordResetToken);
 }

 resetPassword = async (db, user, token) => {
  if (!user.password || !user.username) {
   let e = new Error('username and password required') as HttpError;
   e.responseCode = ResponseCode.BAD_REQUEST;
   throw e;
  }

  user.password = await bcrypt.hash(user.password, 10);

  const dbUser = await findEmailAndPasswordByUsername(db, user.username);
  await verifyPasswordResetToken(token, dbUser.password);
  await updateByUsername(db, user);
 }

 generateTokens = async (db, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await insertToken(db, {token: refreshToken.token, expireAt: new Date(refreshToken.exp * 1000)});

  return {accessToken: accessToken, refreshToken: refreshToken.token};
 }
}
