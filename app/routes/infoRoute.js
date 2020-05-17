const Router = require('express-promise-router');

const infoService = require('../service/infoService');

const router = new Router();

router.get('/me', async (req, res) => {

    try {
        let token = req.headers.authorization;

        const BEARER = "Bearer ";

        if (!token || !token.startsWith(BEARER)) {
            let error = new Error('invalid token');
            error.responseCode = 400;
            throw error;
        }

        token = token.slice(BEARER.length);

        const me = await infoService.me(token);
        res.status(200).json(me);
    } catch (e) {
        res.status(e.responseCode).json(e.message);
    }
});

module.exports = router;
