import { ResponseCode } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { TwoFactorCodeController } from '../controller/two-factor.controller';
import { TwoFactorCode } from '../interface/two-factor-code.interface';

const subRoutes = {
  root: '/',
  request: '/request',
  verify: '/verify',
  loginVerify: '/loginVerify',
  socialLoginVerify: '/socialLoginVerify'
};

export const publicRoutes = [
  subRoutes.loginVerify
];

export const router = Router();

router.post(subRoutes.request, async (req: Request, res: Response) => {
  const twoFactorCodeController = new TwoFactorCodeController();
  const context = res.locals.ctx;

  const response = await twoFactorCodeController.request(
    context.postgresql_provider,
    context.message_queue_provider,
    {
        username: context.username,
        phoneNumber: req.body.phoneNumber,
        languageCode: req.body.languageCode
    } as TwoFactorCode
  );
  
  res.status( ResponseCode.OK ).json( response );
});

router.post( subRoutes.verify, async (req: Request, res: Response ) => {
  const twoFactorCodeController = new TwoFactorCodeController();
  const context = res.locals.ctx;

  await twoFactorCodeController.verify(
    context.postgresql_provider,
    context.username,
    req.body.code
  )
 
  res.status(ResponseCode.OK).json( {} );
})

router.post( subRoutes.loginVerify, async (req: Request, res: Response ) => {
  const twoFactorCodeController = new TwoFactorCodeController();
  const context = res.locals.ctx;

  const loginVerifyResponse = await twoFactorCodeController.loginVerify(
    context.postgresql_provider,
    context.message_queue_provider,
    req.body.code,
    req.body.preAuthToken
  )
 
  return res.status( ResponseCode.OK ).json( loginVerifyResponse );
})

router.post( subRoutes.socialLoginVerify, async (req: Request, res: Response ) => {
  const twoFactorCodeController = new TwoFactorCodeController();
  const context = res.locals.ctx;

  const socialLoginVerifyResponse = await twoFactorCodeController.socialLoginVerify(
    context.postgresql_provider,
    context.message_queue_provider,
    req.body.code,
    req.body.preAuthToken,
    req.body.data
  )
 
  return res.status( ResponseCode.OK ).json( socialLoginVerifyResponse );
})