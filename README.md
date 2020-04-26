# auth-server-nodejs-template
Auth Server Template in NodeJS Express.js



### Social Logins
* Github:

  INSERT INTO social_logins
  VALUES(
    'GITHUB', 
    '<Github Client Id>', 
    '<State>', 
    '<Github Client Secret>', 
    '<Redirect Url>', 
    'https://github.com/login/oauth/authorize?client_id={{0}}&state={{1}}&redirect_uri={{2}}',
    'https://github.com/login/oauth/access_token?client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}',
    'access_token',
    'https://api.github.com/user',
    'id',
    'email',
    'token_type',
    true
  );

* Facebook:
  INSERT INTO social_logins
  VALUES(
    'FACEBOOK', 
    '<Facebook Client Id>', 
    '', 
    '<Facebook Client Id>', 
	  '<Redirect Url>', 
	  'https://www.facebook.com/v6.0/dialog/oauth?client_id={{0}}&redirect_uri={{2}}',
	  'https://graph.facebook.com/oauth/access_token?client_id={{0}}&client_secret={{1}}&redirect_uri={{2}}&code={{3}}&grant_type=client_credentials',
    'access_token',
    'https://graph.facebook.com/me?fields=id,email&access_token={{0}}',
    'id',
    'email',
    '',
    false
  );