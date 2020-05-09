const bcrypt = require('bcrypt');
const capitalize = require('capitalize');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

const builder = require('../util/builder');
const requestHelper = require('../util/requestHelper');
const parser = require('../util/parser');

const socialLoginDao = require('../dao/socialLoginDao');
const userDao = require('../dao/userDao');

const authService = require('../service/authService.js');

const uuid = require('uuid');

const service = {
    loginUrl: async (data) => {
        let loginUrl = "";
        try {
            let socialLoginParams = await socialLoginDao.findSocialLoginByKey(data.key);

            // if oauth version 2
            if (socialLoginParams.v2Config) {
                const params = [socialLoginParams.v2Config.client_id, data.state, socialLoginParams.v2Config.redirect_uri];
                loginUrl = builder.buildUrl(socialLoginParams.v2Config.login_uri, params);
            } else if (socialLoginParams.v1Config) {
                const oAuthRequestToken = await service.getOAuthRequestToken(socialLoginParams.v1Config);
                loginUrl = builder.buildUrl(socialLoginParams.v1Config.login_uri, [oAuthRequestToken]);
            }
        } catch (e) {
            throw e;
        }
        return loginUrl;
    },

    login: async (data) => {
        try {
            const socialLoginParams = await socialLoginDao.findSocialLoginByKey(data.key);

            // if oauth version 2
            if (socialLoginParams.v2Config) {
                return await service.loginForOauthV2(socialLoginParams.v2Config, data);
            } else if (socialLoginParams.v1Config) {
                return await service.loginForOauthV1(socialLoginParams.v1Config, data);
            }
        } catch (e) {
            console.error(e);
            let error = new Error();
            error.message = "Bad credentials";
            error.responseCode = 403;
            throw error;
        }
    },

    loginForOauthV1: async (config, params) => {
        let accessTokenData = await service.getAccessTokenDataForOauthV1(config, params);
        if (!accessTokenData.token) {
            console.error('Access token couldn\'t obtained');
            throw new Error();
        }

        let userData = accessTokenData.userData;
        if (!userData.external_user_id) {
            console.error('User data couldn\'t obtained');
            throw new Error();
        }

        return await service.loginUserWithUserData(params.key, userData);
    },

    loginForOauthV2: async (config) => {
        let accessTokenData = await service.getAccessTokenDataForOauthV2(config);
        if (!accessTokenData.token) {
            console.error('Access token couldn\'t obtained');
            throw new Error();
        }

        let userData = await service.getUserDataWithAccessToken(accessTokenData, config);
        if (!userData.external_user_id) {
            console.error('User data couldn\'t obtained');
            throw new Error();
        }

        return await service.loginUserWithUserData(params.key, userData);
    },

    getUserDataWithAccessToken: async (accessTokenData, config) => {
        // getting user data with access token
        let userDataUrl = config.user_data_uri;
        let headers = {
            'Accept': 'application/json',
        };

        if (config.requested_with_auth_header) {
            // default authorization token type
            const tokenType = accessTokenData.type ? capitalize(accessTokenData.type) : 'Bearer';
            headers = {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
                'Authorization': tokenType + ' ' + accessTokenData.token
            };
        } else {
            userDataUrl = builder.buildUrl(config.user_data_uri, [accessTokenData.token]);
        }

        const userDataResponse = await requestHelper.doGetRequest(userDataUrl, headers);

        const external_user_id = parser.getJsonValue(userDataResponse, config.external_user_id_json_field_path);
        const external_user_email = parser.getJsonValue(userDataResponse, config.external_user_email_json_field_path);
        const external_username = parser.getJsonValue(userDataResponse, config.external_username_json_field_path);

        return {
            external_user_id: external_user_id,
            external_user_email: external_user_email,
            external_username: external_username
        };
    },

    getAccessTokenDataForOauthV1: async (config, params) => {
        const accessTokenParams = [params.oauth_token, params.oauth_verifier];
        const accessTokenUrl = builder.buildUrl(config.access_token_uri, accessTokenParams);

        let accessTokenResponse;
        if (config.access_token_request_method === 'GET') {
            accessTokenResponse = await requestHelper.doGetRequest(accessTokenUrl, {});
        } else if (config.access_token_request_method === 'POST') {
            accessTokenResponse = await requestHelper.doPostRequest(accessTokenUrl, {});
        }

        const urlParams = new URLSearchParams(accessTokenResponse);

        let oAuthTokenParam = urlParams.get(config.access_token_query_param_field_path);

        const userData = {
            external_user_id: urlParams.get(config.external_user_id_query_param_field_path),
            external_user_email: urlParams.get(config.external_user_email_query_param_field_path),
            external_username: urlParams.get(config.external_username_query_param_field_path)
        }

        return {
            token: oAuthTokenParam,
            userData: userData
        };
    },

    getAccessTokenDataForOauthV2: async (config, params) => {
        const headers = {
            'Accept': 'application/json'
        }
        const accessTokenParams = [config.client_id, config.client_secret, config.redirect_uri, params.code, params.state];
        const accessTokenUrl = builder.buildUrl(config.access_token_uri, accessTokenParams);

        let accessTokenResponse;
        if (config.access_token_request_method === 'GET') {
            accessTokenResponse = await requestHelper.doGetRequest(accessTokenUrl, headers);
        } else if (config.access_token_request_method === 'POST') {
            accessTokenResponse = await requestHelper.doPostRequest(accessTokenUrl, headers);
        }

        const accessToken = parser.getJsonValue(accessTokenResponse, config.access_token_json_field_path);

        let tokenType = params.tokenType;

        if (!tokenType) {
            tokenType = parser.getJsonValue(accessTokenResponse, config.token_type_json_field_path);
        }

        return {
            token: accessToken,
            type: tokenType
        };
    },

    loginUserWithUserData: async (key, userData) => {
        // checking social login mapping to determine if signup or login
        let socialLoginUser = await socialLoginDao.findMappingDataByExternalUserId(key, userData.external_user_id);

        if (socialLoginUser) {
            // login user, generate token
            return await authService.generateTokens(socialLoginUser);
        } else {
            // signup user and generate token
            const autoGeneratedUserName = uuid.v4();
            const autoGeneratedPassword = uuid.v4();

            socialLoginUser = {
                username: autoGeneratedUserName,
                password: autoGeneratedPassword,
                email: userData.external_user_email
            }

            await service.signup(socialLoginUser);
            await socialLoginDao.insertSocialLoginMapping(key, userData.external_user_id, userData.external_username, userData.external_user_email, autoGeneratedUserName);

            return await authService.generateTokens(socialLoginUser);
        }
    },

    signup: async (user) => {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await userDao.insertUser({username: user.username, password: hashedPassword});
            await userDao.verifyUser(user.username);
        } catch (e) {
            throw e
        }
    },

    getOAuthRequestToken: async (config) => {
        const oauth = OAuth({
            consumer: {
                key: config.client_id,
                secret: config.client_secret
            },
            signature_method: 'HMAC-SHA1',
            hash_function: service.hash_function_sha1,
        });

        const request_data = {
            url: config.request_token_uri,
            method: 'POST',
            data: {oauth_callback: config.redirect_uri},
        }

        let headers = oauth.toHeader(oauth.authorize(request_data));

        const oAuthRequestTokenResponse = await requestHelper.doPostRequest(config.request_token_uri, headers);
        const urlParams = new URLSearchParams(oAuthRequestTokenResponse);

        if (urlParams.has('oauth_token')) {
            return urlParams.get('oauth_token');
        }

        return '';
    },

    hash_function_sha1(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
}

module.exports = service;