const Router = require('express-promise-router');

const authService = require('../service/authService');

const router = new Router();

router.post('/signup', async (req, res) => {
 await authService.signup({username: req.body.username, password: req.body.password, email: req.body.email});
 res.status(201).json({email: req.body.email});
});

router.post('/login', async (req, res) => {
 const response = await authService.login({username: req.body.username, password: req.body.password});
 res.status(200).json({accessToken: response.accessToken, refreshToken: response.refreshToken})
});

router.post('/logout', async (req, res) => {
 await authService.logout(req.body.token);
 res.status(204).json({});
});

router.post('/token', async (req, res) => {
 const accessToken = await authService.token(req.body.token);
 res.status(200).json({accessToken: accessToken, refreshToken: req.body.token})
});

router.get('/verify', async (req, res) => {
 await authService.verify(req.query.token);
 res.status(200).json({});
});

router.post('/forget-password', async (req, res) => {
 await authService.forgetPassword(req.body.username);
 res.status(200).json({})
});

router.post('/reset-password', async (req, res) => {
 await authService.resetPassword({username: req.body.username, password: req.body.password}, req.body.token);
 res.status(200).json({})
});

module.exports = router;
