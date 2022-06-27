/**
 * @description holds monitor routes
 */

import { ResponseCode } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { version } from '../../version';

const subRoutes = {
  root: '/',
  alive: '/alive',
};

export const router = Router();

router.get( subRoutes.alive, async ( _req: Request, res: Response ) => {
  // check system is alive
  res.status( ResponseCode.OK ).json( { version } );
} );
