import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { AuthController } from '../controller/auth.controller';

const subRoutes = {
  root: '/',
  signup: '/signup',
  login: '/login',
  logout: '/logout',
  token: '/token',
  verify: '/verify',
  forgetPassword: '/forget-password',
  resetPassword: '/reset-password',
};

export const router = Router();
const authController = new AuthController();

router.post(subRoutes.signup, async (req: Request, res: Response) => {
  await authController.signup(res.locals.ctx.dbProviders.postgreSqlProvider, {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  res.status(201).json({ email: req.body.email });
});

router.post(subRoutes.login, async (req: Request, res: Response) => {
  const response = await authController.login(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    {
      username: req.body.username,
      password: req.body.password,
    }
  );
  res.status(200).json({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
});

router.post(subRoutes.logout, async (req: Request, res: Response) => {
  await authController.logout(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.body.token
  );
  res.status(204).json({});
});

router.post(subRoutes.token, async (req: Request, res: Response) => {
  const accessToken = await authController.token(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.body.token
  );
  res
    .status(200)
    .json({ accessToken: accessToken, refreshToken: req.body.token });
});

router.post(subRoutes.verify, async (req: Request, res: Response) => {
  await authController.verify(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.query.token
  );
  res.status(200).json({});
});

router.post(subRoutes.forgetPassword, async (req: Request, res: Response) => {
  await authController.forgetPassword(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.body.username
  );
  res.status(200).json({});
});

router.post(subRoutes.resetPassword, async (req: Request, res: Response) => {
  await authController.resetPassword(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    {
      username: req.body.username,
      password: req.body.password,
    },
    req.body.token
  );
  res.status(200).json({});
});
