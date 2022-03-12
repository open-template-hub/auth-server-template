/**
 * @description holds index routes
 */

import {
  mount as mountApp,
  MountArgs,
  ContextArgs,
  RouteArgs,
  MountAssets,
  Route,
} from '@open-template-hub/common';
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
  export function mount(app: any) {
    const envArgs = new Environment().args();

    const ctxArgs = { envArgs } as ContextArgs;

    const assets = {
      mqChannelTag: envArgs.mqArgs?.authServerMessageQueueChannel as string,
      queueConsumer: new AuthQueueConsumer(),
      applicationName: 'AuthServer',
    } as MountAssets;

    var routes: Array<Route> = [];

    routes.push({ name: subRoutes.auth, router: authRouter });
    routes.push({ name: subRoutes.info, router: infoRouter });
    routes.push({ name: subRoutes.monitor, router: monitorRouter });
    routes.push({ name: subRoutes.social, router: socialLoginRouter });
    routes.push({ name: subRoutes.twoFactorCode, router: twoFactorCodeRouter });

    const routeArgs = { routes } as RouteArgs;

    const args = {
      app,
      ctxArgs,
      routeArgs,
      assets,
    } as MountArgs;

    mountApp(args);
  }
}
