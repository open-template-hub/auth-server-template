const Router = require('express-promise-router');

const authService = require('../service/authService');

const router = new Router();

router.post('/signup', async (req, res) => {

    try {
        await authService.signup({username: req.body.username, password: req.body.password, email: req.body.email});
        res.status(201).json({email: req.body.email});
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

router.post('/login', async (req, res) => {

    try {
        const response = await authService.login({username: req.body.username, password: req.body.password});
        res.status(200).json({accessToken: response.accessToken, refreshToken: response.refreshToken})
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

router.post('/logout', async (req, res) => {

    try {
        await authService.logout(req.body.token);
        res.status(204).json({});
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

router.post('/token', async (req, res) => {

    try {
        const accessToken = await authService.token(req.body.token);
        res.status(200).json({accessToken: accessToken, refreshToken: req.body.token})
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

router.get('/verify', async (req, res) => {

    try {
        await authService.verify(req.query.token);
        res.status(200).json({});
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

router.post('/forget-password', async (req, res) => {

    try {
        await authService.forgetPassword(req.body.username);
        res.status(200).json({})
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

router.post('/reset-password', async (req, res) => {

    try {
        await authService.resetPassword({username: req.body.username, password: req.body.password}, req.body.token);
        res.status(200).json({})
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

module.exports = router;
