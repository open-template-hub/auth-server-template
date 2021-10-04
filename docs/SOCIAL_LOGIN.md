<p align="center">
  <a href="https://www.linkedin.com/company/open-template-hub">
    <img src="https://avatars2.githubusercontent.com/u/65504426?s=200&v=4" alt="Logo">
  </a>
</p>

<h1 align="center">
Auth Server Template
<br/>
(Social Login Configuration Guide)
</h1>

Follow the instructions to be able to use social login meshanism

## Social Login Configurations

This is the list of pre-tested social logins. Configuring only what you need to use is enough.

1. [Google](#1-google)
2. [GitHub](#2-github)
3. [Facebook](#3-facebook)
4. [Twitter](#4-twitter)
5. [LinkedIn](#5-linkedin)
6. [Reddit](#6-reddit)
7. [Dribbble](#7-dribbble)
8. [Twitch](#8-twitch)

### 1. Google

Create your application from **[console.developers.google.com](https://console.developers.google.com)**, fill the fields in the **SQL** below appropriately and run the query.

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

### 2. GitHub

Create your application from **[github.com/settings/developers](https://github.com/settings/developers)**, fill the fields in the **SQL** below appropriately and run the query.

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
VALUES (
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

### 3. Facebook

Create your application from **[developers.facebook.com](https://developers.facebook.com)**, fill the fields in the **SQL** below appropriately and run the query.

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

### 4. Twitter

Create your application from **[developer.twitter.com/en/apps](https://developer.twitter.com/en/apps)**, fill the fields in the **SQL** below appropriately and run the query.

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

### 5. LinkedIn

Create your application from **[linkedin.com/developers/apps](https://linkedin.com/developers/apps)**, fill the fields in the **SQL** below appropriately and run the query.

``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('LINKEDIN', 'https://linkedin.com/developers/apps');
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

### 6. Reddit

Create your application from **[reddit.com/prefs/apps](https://reddit.com/prefs/apps)**, fill the fields in the **SQL** below appropriately and run the query.

``` sql
INSERT INTO social_logins (social_login_key, developer_notes) VALUES ('REDDIT', 'https://reddit.com/prefs/apps');
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

### 7. Dribbble

Create your application from **[dribbble.com/account/applications](https://dribbble.com/account/applications)**, fill the fields in the **SQL** below appropriately and run the query.

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

### 8. Twitch

Create your application from **[dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)**, fill the fields in the **SQL** below appropriately and run the query.

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
);
```
