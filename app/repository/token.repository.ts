import { HttpError } from '../util/http-error.util';
import { ResponseCode } from '../constant';
import { PostgreSqlProvider } from '../provider/postgre.provider';
import { TokenUtil } from '../util/token.util';

export class TokenRepository {
  constructor(private readonly provider: PostgreSqlProvider) {}

  generateTokens = async (user) => {
    const tokenUtil = new TokenUtil();
    const accessToken = tokenUtil.generateAccessToken(user);
    const refreshToken = tokenUtil.generateRefreshToken(user);

    await this.insertToken({
      token: refreshToken.token,
      expireAt: new Date(refreshToken.exp * 1000),
    });

    return { accessToken: accessToken, refreshToken: refreshToken.token };
  };

  insertToken = async (token) => {
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

  deleteToken = async (token) => {
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

  findToken = async (token) => {
    let res;
    try {
      res = await this.provider.query(
        'SELECT token FROM tokens WHERE token LIKE $1',
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
