/**
 * @description holds context
 */

import { AuthUtil } from './util/auth.util';
import { Context } from './interface/context.interface';
import { PostgreSqlProvider } from './provider/postgre.provider';
import { UserRole } from './enum/user-role.enum';
import { ErrorMessage, ResponseCode } from './constant';
import { TokenUtil } from './util/token.util';
import { HttpError } from './util/http-error.util';

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
    throw new Error(ErrorMessage.FORBIDDEN);
  }

  return {
    postgresql_provider,
    username: currentUser ? currentUser.username : '',
    role,
    isAdmin,
    serviceKey,
    token
  } as Context;
};
