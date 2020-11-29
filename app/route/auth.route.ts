import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { AuthController } from '../controller/auth.controller';
import { Context } from '../interface/context.interface';

const subRoutes = {
  root: '/',
  signup: '/signup',
  login: '/login',
  logout: '/logout',
  token: '/token',
  verify: '/verify',
  forgetPassword: '/forget-password',
  resetPassword: '/reset-password',
  getResetPasswordToken: '/reset-password-token'
};

export const publicRoutes = [
  subRoutes.signup,
  subRoutes.login,
  subRoutes.logout,
  subRoutes.token,
  subRoutes.verify,
  subRoutes.forgetPassword,
  subRoutes.resetPassword,
];

export const adminRoutes = [
  subRoutes.getResetPasswordToken,
];

export const router = Router();

router.post(subRoutes.signup, async (req: Request, res: Response) => {
  const authController = new AuthController();
  const context = res.locals.ctx as Context;
  const response = await authController.signup(context.postgresql_provider, {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  res.status(201).json(response);
});

router.post(subRoutes.login, async (req: Request, res: Response) => {
  const authController = new AuthController();
  const context = res.locals.ctx as Context;
  const response = await authController.login(context.postgresql_provider, {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  res.status(200).json({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
});

router.post(subRoutes.logout, async (req: Request, res: Response) => {
  const authController = new AuthController();
  const context = res.locals.ctx as Context;
  await authController.logout(context.postgresql_provider, req.body.token);
  res.status(204).json({});
});

router.post(subRoutes.token, async (req: Request, res: Response) => {
  const authController = new AuthController();
  const context = res.locals.ctx as Context;
  const accessToken = await authController.token(
    context.postgresql_provider,
    req.body.token
  );
  res
    .status(200)
    .json({ accessToken: accessToken, refreshToken: req.body.token });
});

router.get(subRoutes.verify, async (req: Request, res: Response) => {
  const authController = new AuthController();
  const context = res.locals.ctx as Context;
  await authController.verify(context.postgresql_provider, req.query.token);
  res.status(200).json({});
});

router.post(subRoutes.forgetPassword, async (req: Request, res: Response) => {
  const authController = new AuthController();
  const context = res.locals.ctx as Context;
  await authController.forgetPassword(
    context.postgresql_provider,
    req.body.username
  );
  res.status(200).json({});
});

router.get(subRoutes.getResetPasswordToken, async (req: Request, res: Response) => {
  const authController = new AuthController();
  const context = res.locals.ctx as Context;
  const resetPasswordToken = await authController.forgetPassword(
    context.postgresql_provider,
    req.query.username
  );
  res.status(200).json({ resetPasswordToken });
});

router.post(subRoutes.resetPassword, async (req: Request, res: Response) => {
  const authController = new AuthController();
  const context = res.locals.ctx as Context;
  await authController.resetPassword(
    context.postgresql_provider,
    {
      username: req.body.username,
      password: req.body.password,
    },
    req.body.token
  );
  res.status(200).json({});
});
