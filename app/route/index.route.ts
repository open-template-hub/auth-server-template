/**
 * @description holds index routes
 */

import {
  context,
  DebugLogUtil,
  EncryptionUtil,
  ErrorHandlerUtil,
  MessageQueueProvider,
  PostgreSqlProvider,
  PreloadUtil,
} from '@open-template-hub/common';
import { NextFunction, Request, Response } from 'express';
import { Environment } from '../../environment';
import { AuthQueueConsumer } from '../consumer/auth-queue.consumer';
import { router as authRouter } from './auth.route';
import { router as infoRouter } from './info.route';
import { router as monitorRouter } from './monitor.route';
import { router as socialLoginRouter } from './social-login.route';
import { router as twoFactorCodeRouter } from './two-factor-code.route';

const subRoutes = {
  root: '/',
  monitor: '/monitor',
  auth: '/auth',
  social: '/social',
  info: '/info',
  twoFactorCode: '/2fa',
};

export namespace Routes {
  var environment: Environment;
  var message_queue_provider: MessageQueueProvider;
  var postgresql_provider: PostgreSqlProvider;
  let errorHandlerUtil: ErrorHandlerUtil;
  const debugLogUtil = new DebugLogUtil();

  export function mount(app: any) {
    environment = new Environment();
    errorHandlerUtil = new ErrorHandlerUtil(debugLogUtil, environment.args());

    message_queue_provider = new MessageQueueProvider(environment.args());

    const channelTag = new Environment().args().mqArgs
      ?.authServerMessageQueueChannel as string;
    message_queue_provider.getChannel(channelTag).then((channel: any) => {
      const authQueueConsumer = new AuthQueueConsumer(channel);
      message_queue_provider.consume(
        channel,
        channelTag,
        authQueueConsumer.onMessage,
        1
      );
    });
    const preloadUtil = new PreloadUtil();

    postgresql_provider = new PostgreSqlProvider(
      environment.args(),
      'AuthServer'
    );

    preloadUtil
      .preload(undefined, postgresql_provider)
      .then(() => console.log('DB preloads are completed.'));

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
          undefined,
          postgresql_provider,
          message_queue_provider
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
    app.use(subRoutes.twoFactorCode, twoFactorCodeRouter);

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
