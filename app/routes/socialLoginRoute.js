const Router = require('express-promise-router');

const socialLoginService = require('../service/socialLoginService');

const router = new Router();

router.post('/login-url', async (req, res) => {
 const response = await socialLoginService.loginUrl(req.body);
 res.status(200).json({loginUrl: response})
});

router.post('/login', async (req, res) => {
 const response = await socialLoginService.login(req.body);
 res.status(200).json({accessToken: response.accessToken, refreshToken: response.refreshToken})
});

router.post('/login-with-access-token', async (req, res) => {
 const response = await socialLoginService.loginWithAccessToken(req.body);
 res.status(200).json({accessToken: response.accessToken, refreshToken: response.refreshToken})
});

module.exports = router;
