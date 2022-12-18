import {
  DbArgs,
  EnvArgs,
  ExtendedArgs,
  TokenArgs,
  TwoFactorArgs,
} from '@open-template-hub/common';

export class Environment {
  constructor(private _args: EnvArgs = {} as EnvArgs) {
    const tokenArgs = {
      accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRE,
      accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
      refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE,
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
      joinTeamTokenSecretExpire: process.env.JOIN_TEAM_TOKEN_EXPIRE,
      joinTeamTokenSecret: process.env.JOIN_TEAM_TOKEN_SECRET,

      resetPasswordTokenExpire: process.env.RESET_PASSWORD_TOKEN_EXPIRE,
      resetPasswordTokenSecret: process.env.RESET_PASSWORD_TOKEN_SECRET,

      responseEncryptionSecret: process.env.RESPONSE_ENCRYPTION_SECRET,

      verificationTokenSecret: process.env.VERIFICATION_TOKEN_SECRET,

      preAuthTokenSecret: process.env.PREAUTH_TOKEN_SECRET,
    } as TokenArgs;

    const dbArgs = {
      mongoDbConnectionLimit: process.env.MONGODB_CONNECTION_LIMIT,
      mongoDbUri: process.env.MONGODB_URI,

      postgresqlUri: process.env.DATABASE_URL,
      postgresqlConnectionLimit: process.env.POSTGRESQL_CONNECTION_LIMIT,
    } as DbArgs;

    const extendedArgs = {
      clientResetPasswordUrl: process.env.CLIENT_RESET_PASSWORD_URL,
      clientUrl: process.env.CLIENT_URL,
      clientVerificationSuccessUrl: process.env.CLIENT_VERIFICATION_SUCCESS_URL,
      joinTeamUrl: process.env.JOIN_TEAM_URL
    } as ExtendedArgs;

    const mqArgs = {
      messageQueueConnectionUrl: process.env.CLOUDAMQP_URL,
      authServerMessageQueueChannel: process.env.AUTH_SERVER_QUEUE_CHANNEL,
      orchestrationServerMessageQueueChannel:
        process.env.ORCHESTRATION_SERVER_QUEUE_CHANNEL,
    };

    const twoFactorCodeArgs = {
      twoFactorCodeExpire: process.env.TWO_FACTOR_EXPIRE,
      twoFactorCodeLength: process.env.TWO_FACTOR_CODE_LENGTH,
      twoFactorCodeType: process.env.TWO_FACTOR_CODE_TYPE
    } as TwoFactorArgs

    this._args = {
      tokenArgs,
      dbArgs,
      mqArgs,
      extendedArgs,
      twoFactorCodeArgs
    } as EnvArgs;
  }

  args = () => {
    return this._args;
  };
}
