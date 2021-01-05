/**
 * @description holds token repository
 */

import { HttpError } from '../interface/http-error.interface';
import {
  ResponseCode,
  TokenUtil,
  PostgreSqlProvider,
  User,
} from '@open-template-hub/common';
import { AuthToken } from '../interface/auth-token.interface';
import { Environment } from '../../environment';

export class TokenRepository {
  constructor(private readonly provider: PostgreSqlProvider) {}

  /**
   * generates access and refresh tokens
   * @param user user
   */
  generateTokens = async (user: User): Promise<AuthToken> => {
    const environment = new Environment();
    const tokenUtil = new TokenUtil(environment.args());
    const accessToken = tokenUtil.generateAccessToken(user);
    const refreshToken = tokenUtil.generateRefreshToken(user);

    await this.insertToken({
      token: refreshToken.token,
      expireAt: new Date(refreshToken.exp * 1000),
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken.token,
    } as AuthToken;
  };

  /**
   * saves token
   * @param token token
   */
  insertToken = async (token: any) => {
    let res;
    try {
      res = await this.provider.query(
        'INSERT INTO tokens(token, expire_date) VALUES($1, $2)',
        [token.token, token.expireAt]
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res.rows[0];
  };

  /**
   * deletes token
   * @param token token
   */
  deleteToken = async (token: any) => {
    let res;
    try {
      res = await this.provider.query(
        'DELETE FROM tokens WHERE token LIKE $1',
        [token]
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res.rows[0];
  };

  /**
   * gets token
   * @param token token
   */
  findToken = async (token: any) => {
    let res;
    try {
      res = await this.provider.query(
        'SELECT token FROM tokens WHERE token = $1',
        [token]
      );
    } catch (error) {
      console.error(error);
      throw error;
    }

    if (res.rows.length === 0) {
      let e = new Error('invalid token') as HttpError;
      e.responseCode = ResponseCode.UNAUTHORIZED;
      throw e;
    } else if (res.rows.length > 1) {
      console.error('ambiguous token');
      let e = new Error('internal server error') as HttpError;
      e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
      throw e;
    }

    return res.rows[0];
  };

  /**
   * deletes all expired tokens
   */
  deleteExpiredTokens = async () => {
    let res;
    try {
      res = await this.provider.query(
        "DELETE FROM tokens WHERE expire_date < (now() at time zone 'utc')",
        []
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res.rows[0];
  };
}
