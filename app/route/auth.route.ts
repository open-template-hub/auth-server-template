/**
 * @description holds auth routes
 */

import {
  authorizedBy,
  ResponseCode,
  User,
  UserRole,
} from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
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
  resetPasswordToken: '/reset-password-token',
  user: '/user',
  submittedPhoneNumber: '/submitted-phone-number',
};

export const router = Router();

router.post(subRoutes.signup, async (req: Request, res: Response) => {
  // sign up
  const authController = new AuthController();
  const context = res.locals.ctx;
  const response = await authController.signup(
    context.postgresql_provider,
    context.message_queue_provider,
    {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
    } as User,
    req.body.languageCode
  );
  res.status(ResponseCode.CREATED).json(response);
});

router.post(subRoutes.login, async (req: Request, res: Response) => {
  // login
  const authController = new AuthController();
  const context = res.locals.ctx;
  const response = await authController.login(
    context.postgresql_provider,
    context.message_queue_provider,
    {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
    } as User
  );

  res.status(ResponseCode.OK).json(response);
});

router.post(subRoutes.logout, async (req: Request, res: Response) => {
  //  logout
  const authController = new AuthController();
  const context = res.locals.ctx;
  await authController.logout(context.postgresql_provider, req.body.token);
  res.status(ResponseCode.NO_CONTENT).json({});
});

router.post(subRoutes.token, async (req: Request, res: Response) => {
  // get token
  const authController = new AuthController();
  const context = res.locals.ctx;
  const accessToken = await authController.token(
    context.postgresql_provider,
    req.body.token
  );
  res
    .status(ResponseCode.OK)
    .json({ accessToken: accessToken, refreshToken: req.body.token });
});

router.get(subRoutes.verify, async (req: Request, res: Response) => {
  // verify token
  const authController = new AuthController();
  const context = res.locals.ctx;
  await authController.verify(
    context.postgresql_provider,
    req.query.token as string
  );
  res.status(ResponseCode.NO_CONTENT).json({});
});

router.post(subRoutes.forgetPassword, async (req: Request, res: Response) => {
  // forget password
  const authController = new AuthController();
  const context = res.locals.ctx;
  await authController.forgetPassword(
    context.postgresql_provider,
    context.message_queue_provider,
    req.body.username,
    req.body.languageCode
  );
  res.status(ResponseCode.NO_CONTENT).json({});
});

router.get(
  subRoutes.resetPasswordToken,
  authorizedBy([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    // generate reset password token
    const authController = new AuthController();
    const context = res.locals.ctx;
    const resetPasswordToken = await authController.forgetPassword(
      context.postgresql_provider,
      context.message_queue_provider,
      req.query.username as string,
      undefined,
      true
    );
    res.status(ResponseCode.OK).json({ resetPasswordToken });
  }
);

router.post(subRoutes.resetPassword, async (req: Request, res: Response) => {
  // reset password
  const authController = new AuthController();
  const context = res.locals.ctx;
  await authController.resetPassword(
    context.postgresql_provider,
    {
      username: req.body.username,
      password: req.body.password,
    } as User,
    req.body.token
  );
  res.status(ResponseCode.NO_CONTENT).json({});
});

router.delete(
  subRoutes.user,
  authorizedBy([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    // delete user
    const authController = new AuthController();
    const context = res.locals.ctx;
    await authController.deleteUser(
      context.postgresql_provider,
      context.username,
      {
        username: req.query.username,
      } as User
    );
    res.status(ResponseCode.NO_CONTENT).json({});
  }
);

router.get(
  subRoutes.submittedPhoneNumber,
  authorizedBy([UserRole.ADMIN, UserRole.DEFAULT]),
  async (req: Request, res: Response) => {
    const authController = new AuthController();
    const context = res.locals.ctx;
    const submittedPhoneNumber = await authController.getSubmittedPhoneNumber(
      context.postgresql_provider,
      context.username
    );
    res.status(ResponseCode.OK).json({ phoneNumber: submittedPhoneNumber });
  }
);

router.delete(
  subRoutes.submittedPhoneNumber,
  authorizedBy([UserRole.ADMIN, UserRole.DEFAULT]),
  async (req: Request, res: Response) => {
    const authController = new AuthController();
    const context = res.locals.ctx;
    await authController.deleteSubmittedPhoneNumber(
      context.postgresql_provider,
      context.username
    );
    res.status(ResponseCode.OK).json({});
  }
);
