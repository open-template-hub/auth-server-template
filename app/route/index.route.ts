/**
 * @description holds index routes
 */

import {
  ContextArgs,
  mount as mountApp,
  MountArgs,
  MountAssets,
  Route,
  RouteArgs,
} from '@open-template-hub/common';
import { Environment } from '../../environment';
import { AuthQueueConsumer } from '../consumer/auth-queue.consumer';
import { router as authRouter } from './auth.route';
import { router as infoRouter } from './info.route';
import { router as monitorRouter } from './monitor.route';
import { router as socialLoginRouter } from './social-login.route';
import { router as teamRouter } from './team.route';
import { router as twoFactorCodeRouter } from './two-factor-code.route';

const subRoutes = {
  root: '/',
  monitor: '/monitor',
  auth: '/auth',
  social: '/social',
  info: '/info',
  twoFactorCode: '/2fa',
  team: '/team',
};

export namespace Routes {
  export function mount(app: any) {
    const envArgs = new Environment().args();

    const ctxArgs = {
      envArgs,
      providerAvailability: {
        mongo_enabled: true,
        postgre_enabled: true,
        mq_enabled: true,
        redis_enabled: false,
      },
    } as ContextArgs;

    const assets = {
      mqChannelTag: envArgs.mqArgs?.authServerMessageQueueChannel as string,
      queueConsumer: new AuthQueueConsumer(),
      applicationName: 'AuthServer',
    } as MountAssets;

    const routes: Array<Route> = [];

    routes.push({ name: subRoutes.auth, router: authRouter });
    routes.push({ name: subRoutes.info, router: infoRouter });
    routes.push({ name: subRoutes.monitor, router: monitorRouter });
    routes.push({ name: subRoutes.social, router: socialLoginRouter });
    routes.push({ name: subRoutes.twoFactorCode, router: twoFactorCodeRouter });
    routes.push({ name: subRoutes.team, router: teamRouter });

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
