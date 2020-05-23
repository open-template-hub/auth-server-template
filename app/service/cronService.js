const cron = require('node-cron');

const tokenDao = require('../dao/tokenDao');

const service = {
 configureCronJobs: function () {
  cron.schedule('0 0 1 1-12 *', async () => {
   console.log('running clean expired tokens cron job');
   await tokenDao.deleteExpiredTokens();
   console.log('ended clean expired tokens cron job');
  }, {
   timezone: "Etc/UTC"
  });
 }
};

module.exports = service;
