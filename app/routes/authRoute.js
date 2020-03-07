const Router = require('express-promise-router');

const authService = require('../service/authService');

const router = new Router();

router.post('/signup', async (req, res) => {

    try {
        await authService.signup({username: req.body.username, password: req.body.password, email: req.body.email});
        res.sendStatus(201);
    } catch (e) {
        res.status(e.statusCode).json(e.detail);
    }
});

router.post('/login', async (req, res) => {

    try {
        const response = await authService.login({username: req.body.username, password: req.body.password});
        res.json({accessToken: response.accessToken, refreshToken: response.refreshToken})
    } catch (e) {
        res.status(e.statusCode).json(e.detail);
    }
});

router.delete('/logout', async (req, res) => {

    try {
        await authService.logout(req.body.token);
        res.sendStatus(204);
    } catch (e) {
        res.status(e.statusCode).json(e.detail);
    }
});

router.post('/token', async (req, res) => {

    try {
        const accessToken = await authService.token(req.body.token);
        res.json({accessToken: accessToken})

    } catch (e) {
        res.status(e.statusCode).json(e.detail);
    }
});

router.get('/verify', async (req, res) => {

    try {
        await authService.verify(req.query.token);
        res.sendStatus(200);
    } catch (e) {
        res.status(e.statusCode).json(e.detail);
    }
});

module.exports = router;
