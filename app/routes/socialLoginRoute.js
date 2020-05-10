const Router = require('express-promise-router');

const socialLoginService = require('../service/socialLoginService');

const router = new Router();

router.post('/login-url', async (req, res) => {

    try {
        const response = await socialLoginService.loginUrl(req.body);
        res.json({loginUrl: response})
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

router.post('/login', async (req, res) => {

    try {
        const response = await socialLoginService.login(req.body);
        res.json({accessToken: response.accessToken, refreshToken: response.refreshToken})
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

router.post('/login-with-access-token', async (req, res) => {

    try {
        const response = await socialLoginService.loginWithAccessToken(req.body);
        res.json({accessToken: response.accessToken, refreshToken: response.refreshToken})
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

module.exports = router;
