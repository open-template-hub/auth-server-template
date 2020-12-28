/**
 * @description holds user interface
 */

import { UserRole } from '../enum/user-role.enum';

export interface User {
  username: string;
  role: UserRole;
  password: string;
  email: string;
}
