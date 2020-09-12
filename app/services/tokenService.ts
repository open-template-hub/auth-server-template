import jwt from 'jsonwebtoken';
import { ResponseCode } from '../util/constant';

export function generateAccessToken(user) {
 return jwt.sign({
  username: user.username,
  role: user.role
 }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15minutes'});
}

export function generateRefreshToken(user) {
 const token = jwt.sign({
  username: user.username,
  role: user.role
 }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30days'});
 const {exp} = jwt.decode(token);
 return {token: token, exp: exp};
}

export function generateVerificationToken(user) {
 return jwt.sign({username: user.username}, process.env.VERIFICATION_TOKEN_SECRET);
}

export function generatePasswordResetToken(user) {
 return jwt.sign({username: user.username}, process.env.RESET_PASSWORD_TOKEN_SECRET + user.password, {expiresIn: '1day'});
}

export function verifyAccessToken(token) {
 try {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 } catch (e) {
  console.error(e);
  if (e.name === 'JsonWebTokenError') {
   e.responseCode = ResponseCode.FORBIDDEN;
  } else if (e.name === 'TokenExpiredError') {
   e.responseCode = ResponseCode.UNAUTHORIZED;
  }
  throw e;
 }
}

export function verifyRefreshToken(token) {
 try {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
 } catch (e) {
  console.error(e);
  if (e.name === 'JsonWebTokenError') {
   e.responseCode = ResponseCode.FORBIDDEN;
  } else if (e.name === 'TokenExpiredError') {
   e.responseCode = ResponseCode.UNAUTHORIZED;
  }
  throw e;
 }
}

export function verifyVerificationToken(token) {
 try {
  return jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
 } catch (e) {
  console.error(e);
  if (e.name === 'JsonWebTokenError') {
   e.responseCode = ResponseCode.FORBIDDEN;
  } else if (e.name === 'TokenExpiredError') {
   e.responseCode = ResponseCode.UNAUTHORIZED;
  }
  throw e;
 }
}

export function verifyPasswordResetToken(token, currentPassword) {
 try {
  return jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET + currentPassword);
 } catch (e) {
  console.error(e);
  if (e.name === 'JsonWebTokenError') {
   e.responseCode = ResponseCode.FORBIDDEN;
  } else if (e.name === 'TokenExpiredError') {
   e.responseCode = ResponseCode.UNAUTHORIZED;
  }
  throw e;
 }
}
