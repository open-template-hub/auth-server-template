const bcrypt = require('bcrypt');

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
                loginUrl = builder.buildUrl(socialLoginParams.login_uri, params);
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
            } else {
                console.error('Method Not Implemented');
                throw new Error();
            }
        } catch (e) {
            console.error(e);
            let error = new Error();
            error.message = "Bad credentials";
            error.responseCode = 403;
            throw error;
        }
    },

    loginForOauthV2: async(v2Config, params) => {
        let accessToken = await service.getAccessToken(v2Config, params);
        if (!accessToken) {
            console.error('Access token couldn\'t obtained');
            throw new Error();
        }

        let tokenType = parser.getJsonValue(accessTokenResponse, confidentialParams.token_type_json_field_path);

        let userData = await service.getUserDataWithAccessToken(accessToken, tokenType, v2Config);

        return await service.loginUserWithUserData(params.key, userData);
    },

    getUserDataWithAccessToken: async(accessToken, tokenType, v2Config) => {
        // getting user data with access token
        let userDataUrl = v2Config.user_data_uri;
        let headers = headers = {
            'Accept': 'application/json',
        };

        if (v2Config.requested_with_auth_header) {
            // default authorization token type
            tokenType = tokenType ? tokenType : 'Bearer';
            headers = {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
                'Authorization': tokenType + ' ' + accessToken
            }
        } else {
            userDataUrl = builder.buildUrl(v2Config.user_data_uri, [accessToken]);
        }

        const userDataResponse = await requestHelper.doGetRequest(userDataUrl, headers);

        const external_user_id = parser.getJsonValue(userDataResponse, v2Config.external_user_id_json_field_path);
        const external_user_email = parser.getJsonValue(userDataResponse, v2Config.external_user_email_json_field_path);
        const external_username = parser.getJsonValue(userDataResponse, v2Config.external_username_json_field_path);

        if (!external_user_id) {
            console.error('User data couldn\'t obtained');
            throw new Error();
        }

        return {
            external_user_id: external_user_id,
            external_user_email: external_user_email,
            external_username: external_username
        };
    },

    getAccessToken: async(v2Config, params) => {
        const headers = {
            'Accept': 'application/json'
        }
        const accessTokenParams = [v2Config.client_id, v2Config.client_secret, v2Config.redirect_uri, params.code, params.state];
        const accessTokenUrl = builder.buildUrl(v2Config.access_token_uri, accessTokenParams);

        let accessTokenResponse;
        if (v2Config.access_token_request_method === 'GET') {
            accessTokenResponse = await requestHelper.doGetRequest(accessTokenUrl, headers);
        } else if (v2Config.access_token_request_method === 'POST') {
            accessTokenResponse = await requestHelper.doPostRequest(accessTokenUrl, headers);
        }

        const accessToken = parser.getJsonValue(accessTokenResponse, v2Config.access_token_json_field_path);
        return accessToken;
    },

    loginUserWithUserData: async(key, userData) => {
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
            await socialLoginDao.insertSocialLoginMapping(key, userData.external_user_id, userData.external_username, autoGeneratedUserName);

            return await authService.generateTokens(socialLoginUser);
        }
    },

    signup: async (user) => {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await userDao.insertUser({username: user.username, password: hashedPassword, email: user.email});
            await userDao.verifyUser(user.username);
        } catch (e) {
            throw e
        }
    },
}

module.exports = service;