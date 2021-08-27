/**
 * @description holds social login routes
 */

import { ResponseCode } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { SocialLoginController } from '../controller/social-login.controller';

const subRoutes = {
  root: '/',
  loginUrl: '/login-url',
  login: '/login',
  loginWithAccessToken: '/login-with-access-token',
};

export const publicRoutes = [
  subRoutes.loginUrl,
  subRoutes.login,
  subRoutes.loginWithAccessToken,
];

export const router = Router();

const socialLoginController = new SocialLoginController();

router.post( subRoutes.loginUrl, async ( req: Request, res: Response ) => {
  // gets social login url
  const context = res.locals.ctx;
  const response = await socialLoginController.loginUrl(
      context.postgresql_provider,
      req.body
  );
  res.status( ResponseCode.OK ).json( { loginUrl: response } );
} );

router.post( subRoutes.login, async ( req: Request, res: Response ) => {
  // social login
  const context = res.locals.ctx;
  const response = await socialLoginController.login(
      context.postgresql_provider,
      req.body
  );
  res.status( ResponseCode.OK ).json( response );
} );

router.post(
    subRoutes.loginWithAccessToken,
    async ( req: Request, res: Response ) => {
      // login with access token
      const context = res.locals.ctx;
      const response = await socialLoginController.loginWithAccessToken(
          context.postgresql_provider,
          req.body
      );
      res.status( ResponseCode.OK ).json( response );
    }
);
