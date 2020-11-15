import { UserRole } from '../enum/user-role.enum';
import { PostgreSqlProvider } from '../provider/postgre.provider';

export interface Context {
  postgresql_provider: PostgreSqlProvider;
  role: UserRole;
  isAdmin: boolean;
  username: string;
  serviceKey: string;
}