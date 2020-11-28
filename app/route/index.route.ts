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
import { handle } from '../util/error-handler.util';
import { Request, Response } from 'express';
import { PostgreSqlProvider } from '../provider/postgre.provider';
import { EncryptionService } from '../util/encryption.util';
import { debugLog } from '../util/debug-log.util';
import { context } from '../context';

const subRoutes = {
  root: '/',
  monitor: '/monitor',
  auth: '/auth',
  social: '/social',
  info: '/info',
};

export module Routes {
  const postgreSqlProvider = new PostgreSqlProvider();
  var publicRoutes: string[] = [];
  var adminRoutes: string[] = [];

  function populateRoutes(mainRoute, subRoutes) {
    var populated = Array<string>();
    for (var i = 0; i < subRoutes.length; i++) {
      const s = subRoutes[i];
      populated.push(mainRoute + (s === '/' ? '' : s));
    }

    return populated;
  }

  export function mount(app) {
    postgreSqlProvider
      .preload()
      .then(() => debugLog('PostgreSQL preload completed.'));

    publicRoutes = [
      ...populateRoutes(subRoutes.monitor, monitorPublicRoutes),
      ...populateRoutes(subRoutes.auth, authPublicRoutes),
      ...populateRoutes(subRoutes.social, socialLoginPublicRoutes),
    ];
    console.log('Public Routes: ', publicRoutes);

    adminRoutes = [
      ...populateRoutes(subRoutes.auth, authAdminRoutes),
    ];
    console.log('Admin Routes: ', adminRoutes);

    const responseInterceptor = (req, res, next) => {
      var originalSend = res.send;
      const service = new EncryptionService();
      res.send = function () {
        console.log('Starting Encryption: ', new Date());
        let encrypted_arguments = service.encrypt(arguments);
        console.log('Encryption Completed: ', new Date());

        originalSend.apply(res, encrypted_arguments);
      };

      next();
    };

    // Use this interceptor before routes
    app.use(responseInterceptor);

    // INFO: Keep this method at top at all times
    app.all('/*', async (req: Request, res: Response, next) => {
      try {
        // create context
        res.locals.ctx = await context(
          req,
          postgreSqlProvider,
          publicRoutes,
          adminRoutes
        );

        next();
      } catch (err) {
        let error = handle(err);
        res.status(error.code).json({ message: error.message });
      }
    });

    // INFO: Add your routes here
    app.use(subRoutes.monitor, monitorRouter);
    app.use(subRoutes.auth, authRouter);
    app.use(subRoutes.social, socialLoginRouter);
    app.use(subRoutes.info, infoRouter);

    // Use for error handling
    app.use(function (err, req, res, next) {
      let error = handle(err);
      res.status(error.code).json({ message: error.message });
    });
  }
}
