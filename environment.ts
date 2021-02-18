import { EnvArgs } from '@open-template-hub/common';
import * as path from 'path';

export class Environment {
  constructor( private _args: EnvArgs = {} as EnvArgs ) {
    const verifyAccountMailTemplatePath = path.join(
        __dirname,
        '/assets/mail-templates/verify-account-mail-template.html'
    );

    const resetPasswordMailTemplatePath = path.join(
        __dirname,
        '/assets/mail-templates/forget-password-mail-template.html'
    );

    this._args = {
      accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRE,
      accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,

      clientResetPasswordUrl: process.env.CLIENT_RESET_PASSWORD_URL,
      clientUrl: process.env.CLIENT_URL,
      clientVerificationSuccessUrl: process.env.CLIENT_VERIFICATION_SUCCESS_URL,

      postgreSqlUri: process.env.DATABASE_URL,
      postgreSqlConnectionLimit: process.env.POSTGRESQL_CONNECTION_LIMIT,

      mailHost: process.env.MAIL_HOST,
      mailPassword: process.env.MAIL_PASSWORD,
      mailPort: process.env.MAIL_PORT,
      mailUsername: process.env.MAIL_USERNAME,

      refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE,
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,

      resetPasswordTokenExpire: process.env.RESET_PASSWORD_TOKEN_EXPIRE,
      resetPasswordTokenSecret: process.env.RESET_PASSWORD_TOKEN_SECRET,

      responseEncryptionSecret: process.env.RESPONSE_ENCRYPTION_SECRET,

      verificationTokenSecret: process.env.VERIFICATION_TOKEN_SECRET,

      mailServerDisabled: process.env.MAIL_SERVER_DISABLED === 'true',

      resetPasswordMailTemplatePath,
      verifyAccountMailTemplatePath,
    } as EnvArgs;
  }

  args = () => {
    return this._args;
  };
}
