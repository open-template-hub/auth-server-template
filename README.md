<p align="center">
   <a href="https://opentemplatehub.com">
    <img src="https://raw.githubusercontent.com/open-template-hub/open-template-hub.github.io/master/assets/logo/server/auth-server-logo.png" alt="Logo" width=200>
  </a>
</p>

<h1 align="center">
Open Template Hub - Auth Server Template v2
</h1>

[![License](https://img.shields.io/github/license/open-template-hub/auth-server-nodejs-template?color=43b043&style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/open-template-hub/auth-server-nodejs-template?color=43b043&style=for-the-badge)](https://github.com/open-template-hub/auth-server-nodejs-template/issues)
[![PRCLosed](https://img.shields.io/github/issues-pr-closed-raw/open-template-hub/auth-server-nodejs-template?color=43b043&style=for-the-badge)](https://github.com/open-template-hub/auth-server-nodejs-template/pulls?q=is%3Apr+is%3Aclosed)
[![LastCommit](https://img.shields.io/github/last-commit/open-template-hub/auth-server-nodejs-template?color=43b043&style=for-the-badge)](https://github.com/open-template-hub/auth-server-nodejs-template/commits/master)
[![Release](https://img.shields.io/github/release/open-template-hub/auth-server-nodejs-template?include_prereleases&color=43b043&style=for-the-badge)](https://github.com/open-template-hub/auth-server-nodejs-template/releases)
[![SonarCloud](https://img.shields.io/sonar/quality_gate/open-template-hub_auth-server-nodejs-template?server=https%3A%2F%2Fsonarcloud.io&label=Sonar%20Cloud&style=for-the-badge&logo=sonarcloud)](https://sonarcloud.io/dashboard?id=open-template-hub_auth-server-nodejs-template)
[![Postman](https://img.shields.io/badge/Postman-Test%20Results-FF6C37?style=for-the-badge&logo=postman)](https://github.com/open-template-hub/auth-server-nodejs-template/blob/develop/assets/test-results/postman.html)
[![BTC](https://img.shields.io/badge/Donate-BTC-ORANGE?color=F5922F&style=for-the-badge&logo=bitcoin)](https://commerce.coinbase.com/checkout/8313af5f-de48-498d-b2cb-d98819ca7d5e)

Authentication Server Template supporting both regular signup and login processes and login with social networks that support OAuth and OAuth2.0

## Ways to Begin

### 1. Express Deploy

Deploy this template to Heroku

[![Deploy](https://img.shields.io/badge/Deploy_to-Heroku-7056bf.svg?style=for-the-badge&logo=heroku)](https://heroku.com/deploy?template=https://github.com/open-template-hub/auth-server-nodejs-template)

### 2. Start with Server Generator

Create your server with Server Generator Package

[![NPM](https://img.shields.io/badge/NPM-server_generator-cb3837.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@open-template-hub/server-generator)

### 3. GitHub Template

Use this repository as a Template

[![GitHubTemplate](https://img.shields.io/badge/GitHub-Template-24292e.svg?style=for-the-badge&logo=github)](https://github.com/open-template-hub/auth-server-nodejs-template/generate)

## Installations

Install **nodejs** and **npm** via **[nodejs.org](https://nodejs.org)**.

Check installed versions of **nodejs** and **npm** via running following commands:

```
node -v
npm -v
```

Check project's current **nodejs** and **npm** version from **[package.json](package.json)**.

## Environment Variables

If you don't give **RESPONSE_ENCRYPTION_SECRET**, response encryption mechanism will be disabled automatically.

```applescript
PORT={Port}

ACCESS_TOKEN_EXPIRE=1hour
ACCESS_TOKEN_SECRET={Access Token Secret}

CLIENT_RESET_PASSWORD_URL=/reset-password
CLIENT_URL=http://localhost:4200
CLIENT_VERIFICATION_SUCCESS_URL=/verify-account

DATABASE_URL={Database Connection Url}

MAIL_HOST={SMTP Host}
MAIL_PASSWORD={Mail Password}
MAIL_PORT={SMTP Port}
MAIL_USERNAME={Mail Address}

REFRESH_TOKEN_EXPIRE=30days
REFRESH_TOKEN_SECRET={Refresh Token Secret}

RESET_PASSWORD_TOKEN_EXPIRE=1day
RESET_PASSWORD_TOKEN_SECRET={Reset Password Token Secret}

RESPONSE_ENCRYPTION_SECRET={Response Encryption Secret}

VERIFICATION_TOKEN_SECRET={Verification Token Secret}

AUTO_VERIFY={Set true If Auto Verify On SignUp}

POSTGRESQL_CONNECTION_LIMIT={PostgreSQL Connection Limit In Pool}

MAIL_SERVER_DISABLED={Set true If Mail server disabled}

ORCHESTRATION_SERVER_QUEUE_CHANNEL= {Orchestration Server MQ Channel Name}
```

## Social Login Configurations

To be able to use social login mechanism, refer to **[SOCIAL_LOGIN.md](SOCIAL_LOGIN.md)** file.

## Regression Tests

To be able to run regression tests, refer to **[REGRESSION_TESTS.md](REGRESSION_TESTS.md)** file.

## Http Requests

You can find list of available http request in the [requests](assets/requests) directory. You can run http requests directly via **WebStorm**, for more information check out: [jetbrains.com/help/idea/http-client-in-product-code-editor.html](https://jetbrains.com/help/idea/http-client-in-product-code-editor.html)

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/furknyavuz"><img src="https://avatars0.githubusercontent.com/u/2248168?s=460&u=435ef6ade0785a7a135ce56cae751fb3ade1d126&v=4" width="100px;" alt=""/><br /><sub><b>Furkan Yavuz</b></sub></a><br /><a href="https://github.com/open-template-hub/auth-server-nodejs-template/issues/created_by/furknyavuz" title="Answering Questions">💬</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/commits?author=furknyavuz" title="Documentation">📖</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/pulls?q=is%3Apr+reviewed-by%3Afurknyavuz" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/fatihturker"><img src="https://avatars1.githubusercontent.com/u/2202179?s=460&u=261b1129e7106c067783cb022ab9999aad833bdc&v=4" width="100px;" alt=""/><br /><sub><b>Fatih Turker</b></sub></a><br /><a href="https://github.com/open-template-hub/auth-server-nodejs-template/issues/created_by/fatihturker" title="Answering Questions">💬</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/commits?author=fatihturker" title="Documentation">📖</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/pulls?q=is%3Apr+reviewed-by%3Afatihturker" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/mertlsarac"><img src="https://avatars1.githubusercontent.com/u/38442589?s=400&u=aa3cda11724fc297a0bfa6beb35c9be81687cf3c&v=4" width="100px;" alt=""/><br /><sub><b>Mert Sarac</b></sub></a><br /><a href="https://github.com/open-template-hub/auth-server-nodejs-template/issues/created_by/mertlsarac" title="Answering Questions">💬</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/commits?author=mertlsarac" title="Documentation">📖</a> <a href="https://github.com/open-template-hub/auth-server-nodejs-template/pulls?q=is%3Apr+reviewed-by%3Amertlsarac" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## Contributing

* Fork it
* Create your update branch (git checkout -b my-feature-branch)
* Commit your changes (git commit -am 'Add some features')
* Push to the branch (git push origin my-feature-branch)
* Create new Pull Request

## LICENSE

The source code for this project is released under the [MIT License](LICENSE).
