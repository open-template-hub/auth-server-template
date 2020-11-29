import bcrypt from 'bcrypt';
import { HttpError } from '../util/http-error.util';

import axios from 'axios';
import capitalize from 'capitalize';

import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import uuid from 'uuid';
import { Builder } from '../util/builder.util';
import { ResponseCode } from '../constant';
import { Parser } from '../util/parser.util';
import { SocialLoginRepository } from '../repository/social-login.repository';
import { UserRepository } from '../repository/user.repository';
import { TokenRepository } from '../repository/token.repository';
import { AuthToken } from '../interface/auth-token.interface';

const builder = new Builder();
const parser = new Parser();

export class SocialLoginController {
  loginUrl = async (db, data) => {
    let loginUrl = '';
    if (!data.key) {
      let e = new Error('key required') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    const socialLoginRepository = new SocialLoginRepository(db);
    let socialLoginParams = await socialLoginRepository.findSocialLoginByKey(
      data.key
    );

    // if oauth version 2
    if (socialLoginParams.v2Config) {
      const params = [
        socialLoginParams.v2Config.client_id,
        data.state,
        socialLoginParams.v2Config.redirect_uri,
      ];
      loginUrl = builder.buildUrl(socialLoginParams.v2Config.login_uri, params);
    } else if (socialLoginParams.v1Config) {
      const oAuthRequestToken = await this.getOAuthRequestToken(
        socialLoginParams.v1Config
      );
      loginUrl = builder.buildUrl(socialLoginParams.v1Config.login_uri, [
        oAuthRequestToken,
      ]);
    }

    return loginUrl;
  };

  login = async (db, data) => {
    if (!data.key) {
      let e = new Error('key required') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    const socialLoginRepository = new SocialLoginRepository(db);
    const socialLoginParams = await socialLoginRepository.findSocialLoginByKey(
      data.key
    );

    if (socialLoginParams.v2Config) {
      return await this.loginForOauthV2(db, socialLoginParams.v2Config, data);
    } else if (socialLoginParams.v1Config) {
      return await this.loginForOauthV1(db, socialLoginParams.v1Config, data);
    } else {
      let e = new Error('config not found!') as HttpError;
      e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
      throw e;
    }
  };

  loginWithAccessToken = async (db, data): Promise<AuthToken> => {
    try {
      const socialLoginRepository = new SocialLoginRepository(db);
      const socialLoginParams = await socialLoginRepository.findSocialLoginByKey(
        data.key
      );

      if (socialLoginParams.v2Config) {
        let accessTokenData = {
          token: data.accessToken,
          type: data.tokenType,
        };

        return await this.loginWithAccessTokenForOauthV2(
          db,
          accessTokenData,
          socialLoginParams.v2Config,
          data
        );
      } else {
        throw new Error('Method Not Implemented');
      }
    } catch (e) {
      console.error(e);
      e.responseCode = ResponseCode.FORBIDDEN;
      throw e;
    }
  };

  loginForOauthV1 = async (db, config, params) => {
    let accessTokenData = await this.getAccessTokenDataForOauthV1(
      config,
      params
    );
    if (!accessTokenData.token) {
      let e = new Error("Access token couldn't obtained") as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      console.error(e);
      throw e;
    }

    let userData = accessTokenData.userData;
    if (!userData.external_user_id) {
      let e = new Error("User data couldn't obtained") as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      console.error(e);
      throw e;
    }

    return await this.loginUserWithUserData(db, params.key, userData);
  };

  loginForOauthV2 = async (db, config, params) => {
    let accessTokenData = await this.getAccessTokenDataForOauthV2(
      config,
      params
    );
    if (!accessTokenData.token) {
      let e = new Error("Access token couldn't obtained") as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      console.error(e);
      throw e;
    }

    return await this.loginWithAccessTokenForOauthV2(
      db,
      accessTokenData,
      config,
      params
    );
  };

  loginWithAccessTokenForOauthV2 = async (
    db,
    accessTokenData,
    config,
    params
  ): Promise<AuthToken> => {
    let userData = await this.getUserDataWithAccessToken(
      accessTokenData,
      config
    );
    if (!userData.external_user_id) {
      let e = new Error("User data couldn't obtained") as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      console.error(e);
      throw e;
    }

    return await this.loginUserWithUserData(db, params.key, userData);
  };

  getUserDataWithAccessToken = async (accessTokenData, config) => {
    // getting user data with access token
    let userDataUrl = config.user_data_uri;
    let headers = {
      Accept: 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
      Authorization: '',
      'Client-ID': config.client_id,
    };

    if (config.requested_with_auth_header) {
      // default authorization token type
      const tokenType = accessTokenData.type
        ? capitalize(accessTokenData.type)
        : 'Bearer';
      headers = {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
        Authorization: tokenType + ' ' + accessTokenData.token,
        'Client-ID': config.client_id,
      };
    } else {
      userDataUrl = builder.buildUrl(config.user_data_uri, [
        accessTokenData.token,
      ]);
    }

    const userDataResponse = await axios.get<any>(`${userDataUrl}`, {
      headers,
    });

    const external_user_id = parser.getJsonValue(
      userDataResponse.data,
      config.external_user_id_json_field_path
    );
    const external_user_email = parser.getJsonValue(
      userDataResponse.data,
      config.external_user_email_json_field_path
    );
    const external_username = parser.getJsonValue(
      userDataResponse.data,
      config.external_username_json_field_path
    );

    return {
      external_user_id: external_user_id,
      external_user_email: external_user_email,
      external_username: external_username,
    };
  };

  getAccessTokenDataForOauthV1 = async (config, params) => {
    const accessTokenParams = [params.oauth_token, params.oauth_verifier];
    const accessTokenUrl = builder.buildUrl(
      config.access_token_uri,
      accessTokenParams
    );

    let accessTokenResponse;
    if (config.access_token_request_method === 'GET') {
      accessTokenResponse = await axios.get<any>(`${accessTokenUrl}`, {});
    } else if (config.access_token_request_method === 'POST') {
      accessTokenResponse = await axios.post<any>(`${accessTokenUrl}`, {});
    }

    const urlParams = new URLSearchParams(accessTokenResponse.data);

    let oAuthTokenParam = urlParams.get(
      config.access_token_query_param_field_path
    );

    const userData = {
      external_user_id: urlParams.get(
        config.external_user_id_query_param_field_path
      ),
      external_user_email: urlParams.get(
        config.external_user_email_query_param_field_path
      ),
      external_username: urlParams.get(
        config.external_username_query_param_field_path
      ),
    };

    return {
      token: oAuthTokenParam,
      userData: userData,
    };
  };

  getAccessTokenDataForOauthV2 = async (config, params) => {
    const headers = {
      Accept: 'application/json',
    };
    const accessTokenParams = [
      config.client_id,
      config.client_secret,
      config.redirect_uri,
      params.code,
      params.state,
    ];
    const accessTokenUrl = builder.buildUrl(
      config.access_token_uri,
      accessTokenParams
    );

    let accessTokenResponse;
    if (config.access_token_request_method === 'GET') {
      accessTokenResponse = await axios.get<any>(`${accessTokenUrl}`, {
        headers,
      });
    } else if (config.access_token_request_method === 'POST') {
      accessTokenResponse = await axios.post<any>(
        `${accessTokenUrl}`,
        {},
        { headers }
      );
    }

    const accessToken = parser.getJsonValue(
      accessTokenResponse.data,
      config.access_token_json_field_path
    );

    let tokenType = params.tokenType;

    if (!tokenType) {
      tokenType = parser.getJsonValue(
        accessTokenResponse.data,
        config.token_type_json_field_path
      );
    }

    return {
      token: accessToken,
      type: tokenType,
    };
  };

  loginUserWithUserData = async (db, key, userData): Promise<AuthToken> => {
    // checking social login mapping to determine if signup or login
    const socialLoginRepository = new SocialLoginRepository(db);
    let socialLoginUser = await socialLoginRepository.findMappingDataByExternalUserId(
      key,
      userData.external_user_id
    );

    const tokenRepository = new TokenRepository(db);

    if (socialLoginUser) {
      // login user, generate token
      return await tokenRepository.generateTokens(socialLoginUser);
    } else {
      // signup user and generate token
      const autoGeneratedUserName = uuid.v4();
      const autoGeneratedPassword = uuid.v4();

      socialLoginUser = {
        username: autoGeneratedUserName,
        password: autoGeneratedPassword,
        email: userData.external_user_email,
      };

      await this.signup(db, socialLoginUser);
      await socialLoginRepository.insertSocialLoginMapping(
        key,
        userData.external_user_id,
        userData.external_username,
        userData.external_user_email,
        autoGeneratedUserName
      );

      return await tokenRepository.generateTokens(socialLoginUser);
    }
  };

  signup = async (db, user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const userRepository = new UserRepository(db);
    await userRepository.insertUser({
      username: user.username,
      password: hashedPassword,
    });
    await userRepository.verifyUser(user.username);
  };

  getOAuthRequestToken = async (config) => {
    const oauth = new OAuth({
      consumer: {
        key: config.client_id,
        secret: config.client_secret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function: this.hash_function_sha1,
    });

    const request_data = {
      url: config.request_token_uri,
      method: 'POST',
      data: { oauth_callback: config.redirect_uri },
    };

    let headers = oauth.toHeader(oauth.authorize(request_data));

    const oAuthRequestTokenResponse = await axios.post<any>(
      `${config.request_token_uri}`,
      {},
      { headers }
    );

    const urlParams = new URLSearchParams(oAuthRequestTokenResponse.data);

    if (urlParams.has('oauth_token')) {
      return urlParams.get('oauth_token');
    }

    return '';
  };

  hash_function_sha1(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
}
