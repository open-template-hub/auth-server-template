import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { InfoController } from '../controller/info.controller';
import { Context } from '../interface/context.interface';

const subRoutes = {
  root: '/',
  me: '/me',
};

export const router = Router();
const infoController = new InfoController();

router.get(subRoutes.me, async (req: Request, res: Response) => {
  let token = res.locals.token;
  const context = res.locals.ctx as Context;
  const response = await infoController.me(context.postgresql_provider, token);
  res.status(200).json(response);
});
