import jwt from 'jsonwebtoken';
import { ResponseCode, TokenDefaults } from '../constant';

export class TokenUtil {
  generateAccessToken(user) {
    return jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE || TokenDefaults.expire.accessToken,
      }
    );
  }
  
  generateRefreshToken(user) {
    const token = jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn:
          process.env.REFRESH_TOKEN_EXPIRE || TokenDefaults.expire.refreshToken,
      }
    );
    const { exp } = jwt.decode(token);
    return { token: token, exp: exp };
  }
  
  generateVerificationToken(user) {
    return jwt.sign(
      { username: user.username },
      process.env.VERIFICATION_TOKEN_SECRET
    );
  }
  
  generatePasswordResetToken(user) {
    return jwt.sign(
      { username: user.username },
      process.env.RESET_PASSWORD_TOKEN_SECRET + user.password,
      {
        expiresIn:
          process.env.RESET_PASSWORD_TOKEN_EXPIRE ||
          TokenDefaults.expire.resetPasswordToken,
      }
    );
  }
  
  verifyAccessToken(token) {
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
  
  verifyRefreshToken(token) {
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
  
  verifyVerificationToken(token) {
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
  
  verifyPasswordResetToken(token, currentPassword) {
    try {
      return jwt.verify(
        token,
        process.env.RESET_PASSWORD_TOKEN_SECRET + currentPassword
      );
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
}
