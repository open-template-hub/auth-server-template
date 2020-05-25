const Router = require('express-promise-router');

const infoService = require('../service/infoService');

const router = new Router();

router.all('/*', async (req, res, next) => {

 let token = req.headers.authorization;

 const BEARER = "Bearer ";

 if (!token || !token.startsWith(BEARER)) {
  let e = new Error('invalid token');
  e.responseCode = 400;
  throw e;
 }

 token = token.slice(BEARER.length);

 res.locals.token = token;

 next();
});

router.get('/me', async (req, res) => {

 let token = res.locals.token;

 const me = await infoService.me(token);
 res.status(200).json(me);
});

module.exports = router;
