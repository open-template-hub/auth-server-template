import { HttpError } from '../util/http-error.util';
import { ResponseCode } from '../constant';
import { PostgreSqlProvider } from '../provider/postgre.provider';

export class UserRepository {
  constructor(private readonly provider: PostgreSqlProvider) {}

  insertUser = async (user) => {
    try {
      await this.provider.query(
        'INSERT INTO users(username, password, email) VALUES($1, $2, $3)',
        [user.username, user.password, user.email]
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  findUserByUsername = async (username) => {
    let res;
    try {
      res = await this.provider.query(
        'SELECT username, password, verified, role FROM users WHERE username LIKE $1',
        [username]
      );
      this.shouldHaveSingleRow(res);
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res.rows[0];
  };

  findEmailByUsername = async (username) => {
    let res;
    try {
      res = await this.provider.query(
        'SELECT username, email FROM users WHERE username LIKE $1',
        [username]
      );
      this.shouldHaveSingleRow(res);
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res.rows[0];
  };

  findEmailAndPasswordByUsername = async (username) => {
    let res;
    try {
      res = await this.provider.query(
        'SELECT username, email, password FROM users WHERE username LIKE $1',
        [username]
      );
    } catch (error) {
      console.error(error);
      throw error;
    }

    if (res.rows.length === 0) {
      let e = new Error('bad credentials') as HttpError;
      e.responseCode = ResponseCode.FORBIDDEN;
      throw e;
    } else if (res.rows.length > 1) {
      console.error('ambiguous token');
      let e = new Error('internal server error') as HttpError;
      e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
      throw e;
    }

    return res.rows[0];
  };

  verifyUser = async (username) => {
    try {
      await this.provider.query(
        'UPDATE users SET verified = true WHERE username LIKE $1',
        [username]
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  updateByUsername = async (user) => {
    try {
      await this.provider.query(
        'UPDATE users SET password =$1 WHERE username = $2',
        [user.password, user.username]
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  shouldHaveSingleRow = function (res) {
    if (res.rows.length === 0) {
      let e = new Error('user not found') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    } else if (res.rows.length > 1) {
      console.error('ambiguous token');
      let e = new Error('internal server error') as HttpError;
      e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
      throw e;
    }
  };
}
