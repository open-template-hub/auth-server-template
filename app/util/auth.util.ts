/**
 * @description holds auth util
 */

import { TokenUtil } from './token.util';
import { UserRole } from '../enum/user-role.enum';

export class AuthUtil {
  private adminRoles = [UserRole.ADMIN];
  constructor(private readonly tokenService: TokenUtil) {}

  /**
   * gets current user from request
   * @param req request
   * @returns current user
   */
  getCurrentUser = async (req: { headers: { authorization: string } }) => {
    let authToken = '';
    let currentUser = null;

    const authTokenHeader = req.headers.authorization;
    const BEARER = 'Bearer ';

    if (authTokenHeader && authTokenHeader.startsWith(BEARER)) {
      authToken = authTokenHeader.slice(BEARER.length);
      currentUser = await this.tokenService.verifyAccessToken(authToken);
    }

    if (!currentUser) {
      let e: any = new Error('User must be logged in');
      e.responseCode = 403;
      throw e;
    }

    return currentUser;
  };

  /**
   * checks user role is admin or not
   * @param role user role
   * @returns true if admin, else false
   */
  isAdmin = (role: UserRole) => {
    if (this.adminRoles.indexOf(role) >= 0) {
      return true;
    } else {
      return false;
    }
  };
}
