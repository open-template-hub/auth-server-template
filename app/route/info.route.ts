/**
 * @description holds info routes
 */

import { ResponseCode } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { InfoController } from '../controller/info.controller';

const subRoutes = {
  root: '/',
  me: '/me',
};

export const router = Router();
const infoController = new InfoController();

router.get( subRoutes.me, async ( req: Request, res: Response ) => {
  // gets user info
  const context = res.locals.ctx;
  const response = await infoController.me(
      context.postgresql_provider,
      context.token
  );
  res.status( ResponseCode.OK ).json( response );
} );
