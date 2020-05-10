# auth-server-nodejs-template
Auth Server Template in NodeJS Express.js

### Social Logins
* Github:

  INSERT INTO social_logins
  VALUES (
      'GITHUB',
      2,
      'Github login with oauth v2'
  );

  INSERT INTO oauth_v2_config_params
  VALUES (
    'GITHUB',
    '<Github Client Id>', 
    '<Github Client Secret>', 
    '<Redirect Url>',
    'https://localhost/auth',
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

* Facebook:

  INSERT INTO social_logins
  VALUES (
      'FACEBOOK',
      2,
      'Facebook login with oauth v2'
  );

  INSERT INTO oauth_v2_config_params
  VALUES (
    'FACEBOOK',
    '<Facebook Client Id>', 
    '<Facebook Client Secret>', 
	  '<Redirect Url>',
    'https://www.facebook.com/v6.0/dialog/oauth?client_id={{0}}&redirect_uri={{2}}',
    'https://graph.facebook.com/oauth/access_token?client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}&grant_type=client_credentials',
    'access_token',
    'https://graph.facebook.com/me?fields=id,email&access_token={{0}}',
    'id',
    'email',
    null,
    null,
    false,
    'GET'
  );

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/furknyavuz"><img src="https://avatars0.githubusercontent.com/u/2248168?s=460&u=435ef6ade0785a7a135ce56cae751fb3ade1d126&v=4" width="100px;" alt=""/><br /><sub><b>Furkan Yavuz</b></sub></a><br /><a href="https://github.com/furknyavuz/auth-server-nodejs-template/issues/created_by/furknyavuz" title="Answering Questions">💬</a> <a href="https://github.com/furknyavuz/auth-server-nodejs-template/commits?author=furknyavuz" title="Documentation">📖</a> <a href="https://github.com/furknyavuz/auth-server-nodejs-template/pulls?q=is%3Apr+reviewed-by%3Afurknyavuz" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/fatihturker"><img src="https://avatars1.githubusercontent.com/u/2202179?s=460&u=261b1129e7106c067783cb022ab9999aad833bdc&v=4" width="100px;" alt=""/><br /><sub><b>Fatih Turker</b></sub></a><br /><a href="https://github.com/furknyavuz/auth-server-nodejs-template/issues/created_by/fatihturker" title="Answering Questions">💬</a> <a href="https://github.com/furknyavuz/auth-server-nodejs-template/commits?author=fatihturker" title="Documentation">📖</a> <a href="https://github.com/furknyavuz/auth-server-nodejs-template/pulls?q=is%3Apr+reviewed-by%3Afatihturker" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## LICENSE

[MIT](LICENSE)
