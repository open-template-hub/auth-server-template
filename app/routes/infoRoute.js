const Router = require('express-promise-router');

const infoService = require('../service/infoService');

const router = new Router();

router.get('/me', async (req, res) => {

 try {
  let token = req.headers.authorization;

  const BEARER = "Bearer ";

  if (!token || !token.startsWith(BEARER)) {
   let e = new Error('invalid token');
   e.responseCode = 400;
   throw e;
  }

  token = token.slice(BEARER.length);

  const me = await infoService.me(token);
  res.status(200).json(me);
 } catch (e) {
  res.status(e.responseCode ? e.responseCode : 500).json(e.message);
 }
});

module.exports = router;
