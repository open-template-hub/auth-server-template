import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

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
const authService = new AuthService();

router.post(subRoutes.signup, async (req: Request, res: Response) => {
  await authService.signup(res.locals.ctx.dbProviders.postgreSqlProvider, {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  res.status(201).json({ email: req.body.email });
});

router.post(subRoutes.login, async (req: Request, res: Response) => {
  const response = await authService.login(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    {
      username: req.body.username,
      password: req.body.password,
    }
  );
  res
    .status(200)
    .json({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
});

router.post(subRoutes.logout, async (req: Request, res: Response) => {
  await authService.logout(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.body.token
  );
  res.status(204).json({});
});

router.post(subRoutes.token, async (req: Request, res: Response) => {
  const accessToken = await authService.token(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.body.token
  );
  res
    .status(200)
    .json({ accessToken: accessToken, refreshToken: req.body.token });
});

router.post(subRoutes.verify, async (req: Request, res: Response) => {
  await authService.verify(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.query.token
  );
  res.status(200).json({});
});

router.post(subRoutes.forgetPassword, async (req: Request, res: Response) => {
  await authService.forgetPassword(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    req.body.username
  );
  res.status(200).json({});
});

router.post(subRoutes.resetPassword, async (req: Request, res: Response) => {
  await authService.resetPassword(
    res.locals.ctx.dbProviders.postgreSqlProvider,
    {
      username: req.body.username,
      password: req.body.password,
    },
    req.body.token
  );
  res.status(200).json({});
});
