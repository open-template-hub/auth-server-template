/**
 * @description holds token util
 */

import jwt from 'jsonwebtoken';
import { ResponseCode, TokenDefaults } from '../constant';
import { User } from '../interface/user.interface';

export class TokenUtil {
  /**
   * generates access token
   * @param user user
   */
  generateAccessToken = (user: User) => {
    return jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn:
          process.env.ACCESS_TOKEN_EXPIRE || TokenDefaults.expire.accessToken,
      }
    );
  };

  /**
   * generates refresh token
   * @param user user
   */
  generateRefreshToken = (user: User) => {
    const token = jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn:
          process.env.REFRESH_TOKEN_EXPIRE || TokenDefaults.expire.refreshToken,
      }
    );
    const { exp } = jwt.decode(token) as any;
    return { token: token, exp: exp };
  };

  /**
   * generates verification token
   * @param user user
   */
  generateVerificationToken = (user: User) => {
    return jwt.sign(
      { username: user.username },
      process.env.VERIFICATION_TOKEN_SECRET as string
    );
  };

  /**
   * generates password reset token
   * @param user user
   */
  generatePasswordResetToken = (user: User) => {
    return jwt.sign(
      { username: user.username },
      process.env.RESET_PASSWORD_TOKEN_SECRET + user.password,
      {
        expiresIn:
          process.env.RESET_PASSWORD_TOKEN_EXPIRE ||
          TokenDefaults.expire.resetPasswordToken,
      }
    );
  };

  /**
   * verifies access token
   * @param token token
   */
  verifyAccessToken = (token: string) => {
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    } catch (e) {
      console.error(e);
      if (e.name === 'JsonWebTokenError') {
        e.responseCode = ResponseCode.FORBIDDEN;
      } else if (e.name === 'TokenExpiredError') {
        e.responseCode = ResponseCode.UNAUTHORIZED;
      }
      throw e;
    }
  };

  /**
   * verifies refresh token
   * @param token token
   */
  verifyRefreshToken = (token: string) => {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
    } catch (e) {
      console.error(e);
      if (e.name === 'JsonWebTokenError') {
        e.responseCode = ResponseCode.FORBIDDEN;
      } else if (e.name === 'TokenExpiredError') {
        e.responseCode = ResponseCode.UNAUTHORIZED;
      }
      throw e;
    }
  };

  /**
   * verifies verification token
   * @param token token
   */
  verifyVerificationToken = (token: string) => {
    try {
      return jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET as string);
    } catch (e) {
      console.error(e);
      if (e.name === 'JsonWebTokenError') {
        e.responseCode = ResponseCode.FORBIDDEN;
      } else if (e.name === 'TokenExpiredError') {
        e.responseCode = ResponseCode.UNAUTHORIZED;
      }
      throw e;
    }
  };

  /**
   * verifies password reset token
   * @param token token
   * @param currentPassword current password
   */
  verifyPasswordResetToken = (token: string, currentPassword: string) => {
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
  };
}
