import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../constant';
import { HttpError } from '../util/http-error.util';
import { InfoController } from '../controller/info.controller';

const subRoutes = {
  root: '/',
  me: '/me',
};

export const router = Router();
const infoController = new InfoController();

router.get(subRoutes.me, async (req: Request, res: Response) => {
  let token = res.locals.token;

  const response = await infoController.me(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    token
  );
  res.status(200).json(response);
});
