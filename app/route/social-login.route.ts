import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { SocialLoginController } from '../controller/social-login.controller';

const subRoutes = {
  root: '/',
  loginUrl: '/login-url',
  login: '/login',
  loginWithAccessToken: '/login-with-access-token',
};

export const router = Router();

const socialLoginController = new SocialLoginController();

router.post(subRoutes.loginUrl, async (req: Request, res: Response) => {
  const response = await socialLoginController.loginUrl(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.body
  );
  res.status(200).json({ loginUrl: response });
});

router.post(subRoutes.login, async (req: Request, res: Response) => {
  const response = await socialLoginController.login(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.body
  );
  res.status(200).json({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
});

router.post(
  subRoutes.loginWithAccessToken,
  async (req: Request, res: Response) => {
    // const response = await socialLoginController.loginWithAccessToken(req.body);
    // res.status(200).json({
    //   accessToken: response.accessToken,
    //   refreshToken: response.refreshToken,
    // });
  }
);
