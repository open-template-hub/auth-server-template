/**
 * @description holds user repository
 */

import { HttpError, PostgreSqlProvider, ResponseCode, User, } from '@open-template-hub/common';

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
          'INSERT INTO users(username, password, role, email) VALUES($1, $2, $3, $4)',
          [ user.username, user.password, user.role, user.email ]
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
  findUserByUsernameOrEmail = async ( username: string, throwError: boolean = true ) => {
    let res;
    try {
      res = await this.provider.query(
          'SELECT username, password, verified, role, phone_number, two_factor_enabled, email FROM users WHERE username = $1 or email = $1',
          [ username ]
      );
      if ( throwError ) {
        this.shouldHaveSingleRow( res );
      }
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
      const response = await this.provider.query(
          'UPDATE users SET verified = true WHERE username = $1 RETURNING *',
          [ username ]
      );

      this.shouldHaveSingleRow(response);
      return response.rows[0];
    } catch ( error ) {
      console.error( error );
      throw error;
    }
  };

  addPhoneNumberToUser = async ( phoneNumber: string, username: string ) => {
    try {
      await this.provider.query(
          'UPDATE users SET phone_number = $1 where username = $2',
          [ phoneNumber, username ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }
  };

  updateTwoFactorEnabled = async (
      isTwoFactorEnabled: boolean,
      username: string
  ) => {
    try {
      await this.provider.query(
          'UPDATE users set two_factor_enabled = $1 where username = $2',
          [ isTwoFactorEnabled, username ]
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
      await this.provider.query( 'DELETE FROM users WHERE username = $1', [
        username,
      ] );
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

  findVerifiedPhoneNumberByUsername = async ( username: string ) => {
    let res;
    try {
      res = await this.provider.query(
          'SELECT phone_number FROM users WHERE username = $1',
          [ username ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }

    return res.rows;
  };

  deletedSubmittedPhoneNumberByUsername = async ( username: string ) => {
    try {
      await this.provider.query(
          'UPDATE users SET phone_number = null WHERE username = $1',
          [ username ]
      );

      await this.provider.query(
          'UPDATE users SET two_factor_enabled = false WHERE username = $1',
          [ username ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }
  };

  getAllUsers = async ( role: string, verified: boolean | undefined, twoFA: boolean | undefined, oauth: string | undefined, username: string, offset: number, limit: number ) => {
    let response;

    try {
      let whereQueryString = 'WHERE role ILIKE $3 and (users.username LIKE $4 or email LIKE $5)';
      let whereQueryParams: Array<any> = [ '%' + role + '%', '%' + username + '%', '%' + username + '%' ];

      let paramCounter = 6;

      if ( verified !== undefined ) {
        whereQueryString += ` and verified = $${ paramCounter }`;
        paramCounter += 1;
        whereQueryParams.push( verified );
      }

      if ( twoFA !== undefined ) {
        whereQueryString += ` and two_factor_enabled = $${ paramCounter }`;
        paramCounter += 1;
        whereQueryParams.push( twoFA );
      }

      if ( oauth !== undefined ) {
        if ( oauth === 'exclude' ) {
          whereQueryString += ` and social_login_mappings.social_login_key IS NULL`;
        } else {
          whereQueryString += ` and social_login_mappings.social_login_key = $${ paramCounter }`;
          whereQueryParams.push( oauth );
        }
      }

      response = await this.provider.query(
          `SELECT users.username, users.email, users.verified, users.phone_number as phoneNumber, users.two_factor_enabled as twoFactorEnabled, social_login_mappings.external_user_email, social_login_mappings.social_login_key FROM users LEFT JOIN social_login_mappings ON users.username = social_login_mappings.username ${ whereQueryString } ORDER BY users.username OFFSET $1 LIMIT $2`,
          [ offset, limit, ...whereQueryParams ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }

    return response.rows;
  };

  getAllUsersCount = async ( role: string, verified: boolean | undefined, twoFA: boolean | undefined, oauth: string | undefined, username: string ) => {
    let response;
    try {

      let whereQueryString = 'WHERE role ILIKE $1 and users.username LIKE $2';
      let whereQueryParams: any[] = [ '%' + role + '%', '%' + username + '%' ];

      let paramCounter = 3;

      if ( verified !== undefined ) {
        whereQueryString += ` and verified = $${ paramCounter }`;
        paramCounter += 1;
        whereQueryParams.push( verified );
      }

      if ( twoFA !== undefined ) {
        whereQueryString += ` and two_factor_enabled = $${ paramCounter }`;
        paramCounter += 1;
        whereQueryParams.push( twoFA );
      }

      if ( oauth !== undefined ) {
        if ( oauth === 'exclude' ) {
          whereQueryString += ` and social_login_mappings.social_login_key IS NULL`;
        } else {
          whereQueryString += ` and social_login_mappings.social_login_key = $${ paramCounter }`;
          whereQueryParams.push( oauth );
        }
      }

      response = await this.provider.query(
          `SELECT COUNT(*) FROM users LEFT JOIN social_login_mappings ON users.username = social_login_mappings.username ${ whereQueryString }`,
          [ ...whereQueryParams ]
      );
      this.shouldHaveSingleRow( response );
    } catch ( error ) {
      console.log( error );
      throw error;
    }

    return response.rows[ 0 ];
  };
}
