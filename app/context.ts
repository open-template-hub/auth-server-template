/**
 * @description holds context
 */

import { AuthUtil } from './util/auth.util';
import { Context } from './interface/context.interface';
import { PostgreSqlProvider } from './provider/postgre.provider';
import { UserRole } from './enum/user-role.enum';
import { ResponseCode } from './constant';
import { TokenUtil } from './util/token.util';
import { HttpError } from './interface/http-error.interface';

export const context = async (
  req: any,
  postgresql_provider: PostgreSqlProvider,
  publicPaths: string[],
  adminPaths: string[]
) => {
  const tokenUtil = new TokenUtil();
  const authUtil = new AuthUtil(tokenUtil);

  let currentUser: any;
  let publicPath = false;
  let adminPath = false;

  publicPaths.forEach((p) => {
    if (req.path === p) {
      publicPath = true;
      return;
    }
  });

  adminPaths.forEach((p) => {
    if (req.path === p) {
      adminPath = true;
      return;
    }
  });

  let token = req.headers.authorization;

  if (!publicPath) {
    const BEARER = 'Bearer ';

    if (!token || !token.startsWith(BEARER)) {
      let e = new Error('invalid token') as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    token = token.slice(BEARER.length);

    currentUser = await authUtil.getCurrentUser(req);
  }

  const serviceKey = req.body.key;

  const role = currentUser ? (currentUser.role as UserRole) : ('' as UserRole);
  const isAdmin = authUtil.isAdmin(role);

  if (adminPath && !isAdmin) {
    let e = new Error(
      'You do not have right permission to do this operation.'
    ) as HttpError;
    e.responseCode = ResponseCode.FORBIDDEN;
    throw e;
  }

  return {
    postgresql_provider,
    username: currentUser ? currentUser.username : '',
    role,
    isAdmin,
    serviceKey,
    token,
  } as Context;
};
