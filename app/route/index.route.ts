/**
 * @description holds index routes
 */

import {
  router as monitorRouter,
  publicRoutes as monitorPublicRoutes,
} from './monitor.route';
import {
  router as authRouter,
  publicRoutes as authPublicRoutes,
  adminRoutes as authAdminRoutes,
} from './auth.route';
import {
  router as socialLoginRouter,
  publicRoutes as socialLoginPublicRoutes,
} from './social-login.route';
import { router as infoRouter } from './info.route';
import {
  ErrorHandlerUtil,
  PostgreSqlProvider,
  EncryptionUtil,
  DebugLogUtil,
  context,
  PreloadUtil,
} from '@open-template-hub/common';
import { NextFunction, Request, Response } from 'express';
import { Environment } from '../../environment';

const subRoutes = {
  root: '/',
  monitor: '/monitor',
  auth: '/auth',
  social: '/social',
  info: '/info',
};

export module Routes {
  var environment: Environment;
  var postgresql_provider: PostgreSqlProvider;
  const errorHandlerUtil = new ErrorHandlerUtil();
  const debugLogUtil = new DebugLogUtil();

  var publicRoutes: string[] = [];
  var adminRoutes: string[] = [];

  function populateRoutes(mainRoute: string, routes: Array<string>) {
    var populated = Array<string>();
    for (var i = 0; i < routes.length; i++) {
      const s = routes[i];
      populated.push(mainRoute + (s === '/' ? '' : s));
    }

    return populated;
  }

  export function mount(app: any) {
    const preloadUtil = new PreloadUtil();
    environment = new Environment();

    postgresql_provider = new PostgreSqlProvider(
      environment.args(),
      'AuthServer'
    );

    preloadUtil
      .preload(undefined, postgresql_provider)
      .then(() => console.log('DB preloads are completed.'));

    publicRoutes = [
      ...populateRoutes(subRoutes.monitor, monitorPublicRoutes),
      ...populateRoutes(subRoutes.auth, authPublicRoutes),
      ...populateRoutes(subRoutes.social, socialLoginPublicRoutes),
    ];
    console.log('Public Routes: ', publicRoutes);

    adminRoutes = [...populateRoutes(subRoutes.auth, authAdminRoutes)];
    console.log('Admin Routes: ', adminRoutes);

    const responseInterceptor = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      var originalSend = res.send;
      const encryptionUtil = new EncryptionUtil(environment.args());
      res.send = function () {
        console.log('Starting Encryption: ', new Date());
        let encrypted_arguments = encryptionUtil.encrypt(arguments);
        console.log('Encryption Completed: ', new Date());

        originalSend.apply(res, encrypted_arguments as any);
      } as any;

      next();
    };

    // Use this interceptor before routes
    app.use(responseInterceptor);

    // INFO: Keep this method at top at all times
    app.all('/*', async (req: Request, res: Response, next: NextFunction) => {
      try {
        // create context
        res.locals.ctx = await context(
          req,
          environment.args(),
          publicRoutes,
          adminRoutes,
          undefined,
          postgresql_provider
        );

        next();
      } catch (err) {
        let error = errorHandlerUtil.handle(err);
        res.status(error.code).json({ message: error.message });
      }
    });

    // INFO: Add your routes here
    app.use(subRoutes.monitor, monitorRouter);
    app.use(subRoutes.auth, authRouter);
    app.use(subRoutes.social, socialLoginRouter);
    app.use(subRoutes.info, infoRouter);

    // Use for error handling
    app.use(function (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      let error = errorHandlerUtil.handle(err);
      res.status(error.code).json({ message: error.message });
    });
  }
}
