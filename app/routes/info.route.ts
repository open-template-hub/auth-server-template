import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../constant';
import { HttpError } from '../util/http-error.util';
import { me } from '../services/info.service';

const subRoutes = {
  root: '/',
  me: '/me',
};

export const router = Router();

router.use('/*', async (req: Request, res: Response, next) => {
  let token = req.headers.authorization;

  const BEARER = 'Bearer ';

  if (!token || !token.startsWith(BEARER)) {
    let e = new Error('invalid token') as HttpError;
    e.responseCode = ResponseCode.BAD_REQUEST;
    throw e;
  }

  token = token.slice(BEARER.length);

  res.locals.token = token;
  return next();
});

router.get(subRoutes.me, async (req: Request, res: Response) => {
  let token = res.locals.token;

  const response = await me(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    token
  );
  res.status(200).json(response);
});
