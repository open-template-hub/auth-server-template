/**
 * @description holds info routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { InfoController } from '../controller/info.controller';
import { ResponseCode, Context } from '@open-template-hub/common';

const subRoutes = {
  root: '/',
  me: '/me',
};

export const router = Router();
const infoController = new InfoController();

router.get(subRoutes.me, async (req: Request, res: Response) => {
  // gets user info
  const context = res.locals.ctx as Context;
  const response = await infoController.me(
    context.postgresql_provider,
    context.token
  );
  res.status(ResponseCode.OK).json(response);
});
