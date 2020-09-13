import cron from 'node-cron';
import { PostgreSqlProvider } from '../providers/postgresql.provider';
import { TokenRepository } from '../repository/token.repository';

export function configureCronJobs() {
 cron.schedule('0 0 1 1-12 *', async () => {
  console.log('running clean expired tokens cron job');
  const postgreSqlProvider = new PostgreSqlProvider();
  const tokenRepository = new TokenRepository(postgreSqlProvider);
  await tokenRepository.deleteExpiredTokens();
  console.log('ended clean expired tokens cron job');
 }, {
  timezone: 'Etc/UTC'
 });
}

