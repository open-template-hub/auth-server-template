/**
 * @description holds info routes
 */

import { authorizedBy, ResponseCode, UserRole, } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { InfoController } from '../controller/info.controller';

const subRoutes = {
  root: '/',
  me: '/me',
  other: '/other'
};

export const router = Router();
const infoController = new InfoController();

router.get(
    subRoutes.me,
    authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ),
    async ( req: Request, res: Response ) => {
      // gets user info
      const context = res.locals.ctx;
      const response = await infoController.me(
          context.postgresql_provider,
          context.token
      );
      res.status( ResponseCode.OK ).json( response );
    }
);

router.get(
  subRoutes.other,
  authorizedBy( [UserRole.ADMIN ]),
  async( req: Request, res: Response ) => {
    const context = res.locals.ctx;
    const response = await infoController.other(
      context.postgresql_provider,
      req.query.username as string
    );
    res.status( ResponseCode.OK ).json( response );
  }
)
