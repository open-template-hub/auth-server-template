/**
 * @description holds context interface
 */

import { UserRole } from '../enum/user-role.enum';
import { PostgreSqlProvider } from '../provider/postgre.provider';

export interface Context {
  postgresql_provider: PostgreSqlProvider;
  token: string;
  role: UserRole;
  isAdmin: boolean;
  username: string;
  serviceKey: string;
}
