// debug logger
const debug = require('debug');

export const debugLog = (...args) => {
  const tag =
    process.env.PROJECT +
    '-' +
    process.env.MODULE +
    '-' +
    process.env.ENVIRONMENT;

  debug(tag)(args);
};
