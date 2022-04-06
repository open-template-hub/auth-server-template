import { PostgreSqlProvider } from '@open-template-hub/common';

export class TwoFactorCodeRepository {
  constructor( private readonly provider: PostgreSqlProvider ) {
  }

  insertTwoFactorCode = async (
      username: string,
      phone_number: string,
      code: string,
      expiry: string
  ) => {
    try {
      await this.provider.query(
          'INSERT INTO two_factor_auth_codes(username, phone_number, code, expiry) VALUES($1, $2, $3, $4)',
          [
            username,
            phone_number,
            code,
            expiry
          ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }
  };

  findTwoFactorCodeByUsername = async (
      username: string
  ) => {
    let res;
    try {
      res = await this.provider.query(
          'SELECT * FROM two_factor_auth_codes WHERE username = $1 ORDER BY expiry DESC',
          [ username ]
      );
    } catch ( error ) {
      console.error( error );
      throw error;
    }

    return res.rows[ 0 ];
  };
}
