![Logo](https://avatars2.githubusercontent.com/u/65504426?s=200&v=4)

# Auth Server Template

[![License](https://img.shields.io/github/license/open-template-hub/auth-server-nodejs-template?color=2F7488&style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/open-template-hub/auth-server-nodejs-template?color=2F7488&style=for-the-badge)](https://github.com/open-template-hub/auth-server-nodejs-template/issues)
[![PRCLosed](https://img.shields.io/github/issues-pr-closed-raw/open-template-hub/auth-server-nodejs-template?color=2F7488&style=for-the-badge)](https://github.com/open-template-hub/auth-server-nodejs-template/pulls?q=is%3Apr+is%3Aclosed)
[![LastCommit](https://img.shields.io/github/last-commit/open-template-hub/auth-server-nodejs-template?color=2F7488&style=for-the-badge)](https://github.com/open-template-hub/auth-server-nodejs-template/commits/master)
[![Release](https://img.shields.io/github/release/open-template-hub/auth-server-nodejs-template?include_prereleases&color=2F7488&style=for-the-badge)](https://github.com/open-template-hub/auth-server-nodejs-template/releases)
[![SonarCloud](https://img.shields.io/sonar/quality_gate/open-template-hub_auth-server-nodejs-template?server=https%3A%2F%2Fsonarcloud.io&label=Sonar%20Cloud&style=for-the-badge)](https://sonarcloud.io/dashboard?id=open-template-hub_auth-server-nodejs-template)
[![BTC](https://img.shields.io/badge/Donate-BTC-ORANGE?color=F5922F&style=for-the-badge&logo=bitcoin)](https://commerce.coinbase.com/checkout/8313af5f-de48-498d-b2cb-d98819ca7d5e)

Auth Server Template in NodeJS Express.js

## Express Deploy

Deploy this template to Heroku

[![Deploy](https://img.shields.io/badge/↑_Deploy_to-Heroku-7056bf.svg?style=for-the-badge)](https://heroku.com/deploy?template=https://github.com/open-template-hub/auth-server-nodejs-template)

## Configurations
```sh
ACCESS_TOKEN_SECRET={Access Token Secret}
CLIENT_RESET_PASSWORD_URL={Client Reset Password Url}
CLIENT_URL={Client Url}
CLIENT_VERIFICATION_SUCCESS_URL={Client Verification Success Url}
DATABASE_URL={Database Connection Url}
MAIL_HOST={Mail Host}
MAIL_PASSWORD={Mail Password}
MAIL_PORT={Mail Port}
MAIL_USERNAME={Mail Username}
REFRESH_TOKEN_SECRET={Refresh Token Secret}
RESET_PASSWORD_TOKEN_SECRET={Reset Password Token Secret}
VERIFICATION_TOKEN_SECRET={Verification Token Secret}
RESPONSE_ENCRYPTION_SECRET={Response Encryption Secret}
PORT={Port}
```

If you don't give **RESPONSE_ENCRYPTION_SECRET**, response encryption mechanism will be disabled automatically.

## Social Login Configurations

### GITHUB
``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('GITHUB', 'https://github.com/settings/developers');
INSERT INTO oauth_v2_config_params 
			( 
                        social_login_key, 
                        client_id, 
                        client_secret, 
                        redirect_uri, 
                        login_uri, 
                        access_token_uri, 
                        access_token_json_field_path, 
                        user_data_uri, 
                        external_user_id_json_field_path, 
                        external_user_email_json_field_path, 
                        external_username_json_field_path, 
                        token_type_json_field_path, 
                        requested_with_auth_header, 
                        access_token_request_method 
            ) 
            VALUES 
            ( 
                        'GITHUB', 
                        <client_id>, 
                        <client_secret>, 
                        <redirect_uri>, 
                        'https://github.com/login/oauth/authorize?client_id={{0}}&state={{1}}&redirect_uri={{2}}', 
                        'https://github.com/login/oauth/access_token?client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}', 
                        'access_token', 
                        'https://api.github.com/user', 
                        'id', 
                        'email', 
                        'login', 
                        'token_type', 
                        true, 
                        'GET' 
            );
```
### FACEBOOK
``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('FACEBOOK', 'https://developers.facebook.com');
INSERT INTO oauth_v2_config_params 
            ( 
                        social_login_key, 
                        client_id, 
                        client_secret, 
                        redirect_uri, 
                        login_uri, 
                        access_token_uri, 
                        access_token_json_field_path, 
                        user_data_uri, 
                        external_user_id_json_field_path, 
                        external_user_email_json_field_path, 
                        external_username_json_field_path, 
                        token_type_json_field_path, 
                        requested_with_auth_header, 
                        access_token_request_method 
            ) 
            VALUES 
            ( 
                        'FACEBOOK', 
                        <client_id>, 
                        <client_secret>, 
                        <redirect_uri>, 
                        'https://www.facebook.com/v6.0/dialog/oauth?client_id={{0}}&redirect_uri={{2}}', 
                        'https://graph.facebook.com/v6.0/oauth/access_token?client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}#_=_', 
                        'access_token', 
                        'https://graph.facebook.com/me?fields=id,email&access_token={{0}}', 
                        'id', 
                        'email', 
                        NULL, 
                        'token_type', 
                        false, 
                        'GET' 
            );
```
### GOOGLE
``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('GOOGLE', 'https://console.developers.google.com');
INSERT INTO oauth_v2_config_params 
            ( 
                        social_login_key, 
                        client_id, 
                        client_secret, 
                        redirect_uri, 
                        login_uri, 
                        access_token_uri, 
                        access_token_json_field_path, 
                        user_data_uri, 
                        external_user_id_json_field_path, 
                        external_user_email_json_field_path, 
                        external_username_json_field_path, 
                        token_type_json_field_path, 
                        requested_with_auth_header, 
                        access_token_request_method 
            ) 
            VALUES 
            ( 
                        'GOOGLE', 
                        <client_id>, 
                        <client_secret>, 
                        <redirect_uri>, 
                        'https://accounts.google.com/o/oauth2/v2/auth?client_id={{0}}&state={{1}}&redirect_uri={{2}}&response_type=code&scope=openid%20profile%20email', 
                        'https://oauth2.googleapis.com/token?client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}&grant_type=authorization_code', 
                        'access_token', 
                        'https://people.googleapis.com/v1/people/me?personFields=emailAddresses&access_token={{0}}', 
                        'emailAddresses.0.metadata.source.id', 
                        'emailAddresses.0.value', 
                        NULL, 
                        NULL, 
                        false, 
                        'POST' 
            );
```
### TWITTER
``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('TWITTER', 'https://developer.twitter.com/en/apps');
INSERT INTO oauth_v1_config_params 
            ( 
                        social_login_key, 
                        client_id, 
                        client_secret, 
                        redirect_uri, 
                        login_uri, 
                        access_token_uri, 
                        access_token_query_param_field_path, 
                        user_data_uri, 
                        external_user_id_query_param_field_path, 
                        external_user_email_query_param_field_path, 
                        external_username_query_param_field_path, 
                        request_token_uri, 
                        access_token_request_method 
            ) 
            VALUES 
            ( 
                        'TWITTER', 
                        <client_id>, 
                        <client_secret>, 
                        <redirect_uri>, 
                        'https://api.twitter.com/oauth/authenticate?oauth_token={{0}}', 
                        'https://api.twitter.com/oauth/access_token?oauth_token={{0}}&oauth_verifier={{1}}', 
                        'oauth_token', 
                        'https://api.twitter.com/1.1/account/verify_credentials.json', 
                        'user_id', 
                        NULL, 
                        'screen_name', 
                        'https://api.twitter.com/oauth/request_token', 
                        'POST' 
            );
```
### LINKEDIN
``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('LINKEDIN', 'https://www.linkedin.com/developers/apps');
INSERT INTO oauth_v2_config_params 
            ( 
                        social_login_key, 
                        client_id, 
                        client_secret, 
                        redirect_uri, 
                        login_uri, 
                        access_token_uri, 
                        access_token_json_field_path, 
                        user_data_uri, 
                        external_user_id_json_field_path, 
                        external_user_email_json_field_path, 
                        external_username_json_field_path, 
                        token_type_json_field_path, 
                        requested_with_auth_header, 
                        access_token_request_method 
            ) 
            VALUES 
            ( 
                        'LINKEDIN', 
                        <client_id>, 
                        <client_secret>, 
                        <redirect_uri>, 
                        'https://www.linkedin.com/oauth/v2/authorization?client_id={{0}}&state={{1}}&redirect_uri={{2}}&response_type=code&scope=r_liteprofile', 
                        'https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}', 
                        'access_token', 
                        'https://api.linkedin.com/v2/me?projection=(id)', 
                        'id', 
                        NULL, 
                        NULL, 
                        NULL, 
                        true, 
                        'POST' 
            );
```
### REDDIT
``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('REDDIT', 'https://www.reddit.com/prefs/apps/');
INSERT INTO oauth_v2_config_params 
            ( 
                        social_login_key, 
                        client_id, 
                        client_secret, 
                        redirect_uri, 
                        login_uri, 
                        access_token_uri, 
                        access_token_json_field_path, 
                        user_data_uri, 
                        external_user_id_json_field_path, 
                        external_user_email_json_field_path, 
                        external_username_json_field_path, 
                        token_type_json_field_path, 
                        requested_with_auth_header, 
                        access_token_request_method 
            ) 
            VALUES 
            ( 
                        'REDDIT', 
                        <client_id>, 
                        <client_secret>, 
                        <redirect_uri>, 
                        'https://old.reddit.com/api/v1/authorize?client_id={{0}}&state={{1}}&redirect_uri={{2}}&response_type=code&scope=identity&duration=temporary', 
                        'https://{{0}}:{{1}}@www.reddit.com/api/v1/access_token?grant_type=authorization_code&code={{3}}&redirect_uri={{2}}', 
                        'access_token', 
                        'https://oauth.reddit.com/api/v1/me', 
                        'id', 
                        NULL, 
                        'name', 
                        'token_type', 
                        true, 
                        'POST' 
            );
```
### DRIBBBLE
``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('DRIBBBLE', 'https://dribbble.com/account/applications');
INSERT INTO oauth_v2_config_params 
            ( 
                        social_login_key, 
                        client_id, 
                        client_secret, 
                        redirect_uri, 
                        login_uri, 
                        access_token_uri, 
                        access_token_json_field_path, 
                        user_data_uri, 
                        external_user_id_json_field_path, 
                        external_user_email_json_field_path, 
                        external_username_json_field_path, 
                        token_type_json_field_path, 
                        requested_with_auth_header, 
                        access_token_request_method 
            ) 
            VALUES 
            ( 
                        'DRIBBBLE', 
                        <client_id>, 
                        <client_secret>, 
                        <redirect_uri>, 
                        'https://dribbble.com/oauth/authorize?client_id={{0}}&state={{1}}&redirect_uri={{2}}&scope=public', 
                        'https://dribbble.com/oauth/token?client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}', 
                        'access_token', 
                        'https://api.dribbble.com/v2/user', 
                        'id', 
                        NULL, 
                        'login', 
                        'token_type', 
                        true, 
                        'POST' 
            );
```
### TWITCH
``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('TWITCH', 'https://dev.twitch.tv/console/apps');
INSERT INTO oauth_v2_config_params 
            ( 
                        social_login_key, 
                        client_id, 
                        client_secret, 
                        redirect_uri, 
                        login_uri, 
                        access_token_uri, 
                        access_token_json_field_path, 
                        user_data_uri, 
                        external_user_id_json_field_path, 
                        external_user_email_json_field_path, 
                        external_username_json_field_path, 
                        token_type_json_field_path, 
                        requested_with_auth_header, 
                        access_token_request_method 
            ) 
            VALUES 
            ( 
                        'TWITCH', 
                        <client_id>, 
                        <client_secret>, 
                        <redirect_uri>, 
                        'https://id.twitch.tv/oauth2/authorize?client_id={{0}}&state={{1}}&redirect_uri={{2}}&response_type=code&scope=user_read', 
                        'https://id.twitch.tv/oauth2/token?client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}&grant_type=authorization_code', 
                        'access_token', 
                        'https://api.twitch.tv/helix/users', 
                        'data.0.id', 
                        NULL, 
                        'data.0.login', 
                        'token_type', 
                        true, 
                        'POST' 
            );INSERT INTO oauth_v2_config_params 
            ( 
                        social_login_key, 
                        client_id, 
                        client_secret, 
                        redirect_uri, 
                        login_uri, 
                        access_token_uri, 
                        access_token_json_field_path, 
                        user_data_uri, 
                        external_user_id_json_field_path, 
                        external_user_email_json_field_path, 
                        external_username_json_field_path, 
                        token_type_json_field_path, 
                        requested_with_auth_header, 
                        access_token_request_method 
            ) 
            VALUES 
            ( 
                        'TWITCH', 
                        <client_id>, 
                        <client_secret>, 
                        <redirect_uri>, 
                        'https://id.twitch.tv/oauth2/authorize?client_id={{0}}&state={{1}}&redirect_uri={{2}}&response_type=code&scope=user_read', 
                        'https://id.twitch.tv/oauth2/token?client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}&grant_type=authorization_code', 
                        'access_token', 
                        'https://api.twitch.tv/helix/users', 
                        'data.0.id', 
                        NULL, 
                        'data.0.login', 
                        'token_type', 
                        true, 
                        'POST' 
            );
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/furknyavuz"><img src="https://avatars0.githubusercontent.com/u/2248168?s=460&u=435ef6ade0785a7a135ce56cae751fb3ade1d126&v=4" width="100px;" alt=""/><br /><sub><b>Furkan Yavuz</b></sub></a><br /><a href="https://github.com/open-template-hub/auth-server-nodejs-template/issues/created_by/furknyavuz" title="Answering Questions">💬</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/commits?author=furknyavuz" title="Documentation">📖</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/pulls?q=is%3Apr+reviewed-by%3Afurknyavuz" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/fatihturker"><img src="https://avatars1.githubusercontent.com/u/2202179?s=460&u=261b1129e7106c067783cb022ab9999aad833bdc&v=4" width="100px;" alt=""/><br /><sub><b>Fatih Turker</b></sub></a><br /><a href="https://github.com/open-template-hub/auth-server-nodejs-template/issues/created_by/fatihturker" title="Answering Questions">💬</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/commits?author=fatihturker" title="Documentation">📖</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/pulls?q=is%3Apr+reviewed-by%3Afatihturker" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## Contributing

* Fork it
* Create your update branch (git checkout -b my-new-identicon)
* Commit your changes (git commit -am 'Add some identicon')
* Push to the branch (git push origin my-new-identicon)
* Create new Pull Request

## LICENSE

[MIT](LICENSE)
