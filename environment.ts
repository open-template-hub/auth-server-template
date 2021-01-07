import { EnvArgs } from '@open-template-hub/common';
import path from 'path';

export class Environment {
  constructor(private _args: EnvArgs = {} as EnvArgs) {
    const verifyAccountMailTemplatePath = path.join(
      __dirname,
      '/assets/mail-templates/verify-account-mail-template.html'
    );

    const resetPasswordMailTemplatePath = path.join(
      __dirname,
      '/assets/mail-templates/forget-password-mail-template.html'
    );

    console.info(
      '> Environment::constructor => resetPasswordMailTemplatePath: ',
      resetPasswordMailTemplatePath
    );
    console.info(
      '> Environment::constructor => verifyAccountMailTemplatePath: ',
      verifyAccountMailTemplatePath
    );

    this._args = {
      accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
      responseEncryptionSecret: process.env.RESPONSE_ENCRYPTION_SECRET,
      postgreSqlConnectionLimit: process.env.POSTGRESQL_CONNECTION_LIMIT,
      postgreSqlUri: process.env.DATABASE_URL,
      accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRE,
      refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE,
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
      resetPasswordTokenExpire: process.env.RESET_PASSWORD_TOKEN_EXPIRE,
      resetPasswordTokenSecret: process.env.RESET_PASSWORD_TOKEN_SECRET,
      verificationTokenSecret: process.env.VERIFICATION_TOKEN_SECRET,
      mailHost: process.env.MAIL_HOST,
      mailPort: process.env.MAIL_PORT,
      mailUsername: process.env.MAIL_USERNAME,
      mailPassword: process.env.MAIL_PASSWORD,
      mailServerDisabled: process.env.MAIL_SERVER_DISABLED === 'true',
      clientUrl: process.env.CLIENT_URL,
      clientResetPasswordUrl: process.env.CLIENT_RESET_PASSWORD_URL,
      clientVerificationSuccessUrl: process.env.CLIENT_VERIFICATION_SUCCESS_URL,
      resetPasswordMailTemplatePath,
      verifyAccountMailTemplatePath,
    } as EnvArgs;
  }

  args = () => {
    return this._args;
  };
}
