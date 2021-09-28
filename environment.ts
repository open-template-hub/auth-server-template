import {
  DbArgs,
  EnvArgs,
  ExtendedArgs,
  MailArgs,
  TokenArgs,
} from '@open-template-hub/common';

export class Environment {
  constructor(private _args: EnvArgs = {} as EnvArgs) {
    var tokenArgs = {
      accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRE,
      accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
      refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE,
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,

      resetPasswordTokenExpire: process.env.RESET_PASSWORD_TOKEN_EXPIRE,
      resetPasswordTokenSecret: process.env.RESET_PASSWORD_TOKEN_SECRET,

      responseEncryptionSecret: process.env.RESPONSE_ENCRYPTION_SECRET,

      verificationTokenSecret: process.env.VERIFICATION_TOKEN_SECRET,
    } as TokenArgs;

    var dbArgs = {
      postgreSqlUri: process.env.DATABASE_URL,
      postgreSqlConnectionLimit: process.env.POSTGRESQL_CONNECTION_LIMIT,
    } as DbArgs;

    var extentedArgs = {
      clientResetPasswordUrl: process.env.CLIENT_RESET_PASSWORD_URL,
      clientUrl: process.env.CLIENT_URL,
      clientVerificationSuccessUrl: process.env.CLIENT_VERIFICATION_SUCCESS_URL,
    } as ExtendedArgs;

    var mqArgs = {
      messageQueueConnectionUrl: process.env.CLOUDAMQP_URL,
      authServerMessageQueueChannel: process.env.AUTH_SERVER_QUEUE_CHANNEL,
      orchestrationServerMessageQueueChannel:
        process.env.ORCHESTRATION_SERVER_QUEUE_CHANNEL,
    };

    this._args = {
      tokenArgs,
      dbArgs,
      mqArgs,
      extentedArgs,
    } as EnvArgs;
  }

  args = () => {
    return this._args;
  };
}
