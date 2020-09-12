import cron from 'node-cron';
import { deleteExpiredTokens } from '../dao/tokenDao';
import { PostgreSqlProvider } from '../database/postgreSqlProvider';

export function configureCronJobs () {
  cron.schedule('0 0 1 1-12 *', async () => {
   console.log('running clean expired tokens cron job');
   const postgreSqlProvider = new PostgreSqlProvider();
   await deleteExpiredTokens(postgreSqlProvider);
   console.log('ended clean expired tokens cron job');
  }, {
   timezone: "Etc/UTC"
  });
}

