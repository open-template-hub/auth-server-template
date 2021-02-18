/**
 * @description holds user repository
 */

import { HttpError, PostgreSqlProvider, ResponseCode, User } from '@open-template-hub/common';

export class UserRepository {
  constructor( private readonly provider: PostgreSqlProvider ) {
  }

  /**
   * creates user
   * @param user user
   */
  insertUser = async ( user: User ) => {
    try {
      await this.provider.query(
          'INSERT INTO users(username, password, email) VALUES($1, $2, $3)',
          [ user.username, user.password, user.email ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }
  };

  /**
   * gets user by username or email
   * @param username username
   */
  findUserByUsernameOrEmail = async ( username: string ) => {
    let res;
    try {
      res = await this.provider.query(
          'SELECT username, password, verified, role FROM users WHERE username = $1 or email = $1',
          [ username ]
      );
      this.shouldHaveSingleRow( res );
    } catch ( error ) {
      console.error( error );
      throw error;
    }
    return res.rows[ 0 ];
  };

  /**
   * gets email by username
   * @param username username
   */
  findEmailByUsername = async ( username: string ) => {
    let res;
    try {
      res = await this.provider.query(
          'SELECT username, email FROM users WHERE username = $1',
          [ username ]
      );
      this.shouldHaveSingleRow( res );
    } catch ( error ) {
      console.error( error );
      throw error;
    }
    return res.rows[ 0 ];
  };

  /**
   * gets email and password by username
   * @param username username
   */
  findEmailAndPasswordByUsername = async ( username: string ) => {
    let res;
    try {
      res = await this.provider.query(
          'SELECT username, email, password FROM users WHERE username = $1',
          [ username ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }

    if ( res.rows.length === 0 ) {
      let e = new Error( 'bad credentials' ) as HttpError;
      e.responseCode = ResponseCode.FORBIDDEN;
      throw e;
    } else if ( res.rows.length > 1 ) {
      console.error( 'ambiguous token' );
      let e = new Error( 'internal server error' ) as HttpError;
      e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
      throw e;
    }

    return res.rows[ 0 ];
  };

  /**
   * checks user is verified or not
   * @param username username
   */
  verifyUser = async ( username: string ) => {
    try {
      await this.provider.query(
          'UPDATE users SET verified = true WHERE username = $1',
          [ username ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }
  };

  /**
   * updates user password by username
   * @param user user
   */
  updateByUsername = async ( user: User ) => {
    try {
      await this.provider.query(
          'UPDATE users SET password = $1 WHERE username = $2',
          [ user.password, user.username ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }
  };

  /**
   * delete user by username
   * @param username username
   */
  deleteUserByUsername = async ( username: string ) => {
    try {
      await this.provider.query(
          'DELETE FROM users WHERE username = $1',
          [ username ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }
  };

  /**
   * checks response has single row
   * @param res res
   */
  shouldHaveSingleRow = ( res: any ) => {
    if ( res.rows.length === 0 ) {
      let e = new Error( 'user not found' ) as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    } else if ( res.rows.length > 1 ) {
      console.error( 'ambiguous token' );
      let e = new Error( 'internal server error' ) as HttpError;
      e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
      throw e;
    }
  };
}
