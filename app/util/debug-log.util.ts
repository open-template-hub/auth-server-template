/**
 * @description holds debug log util
 */

import debug from 'debug';

export class DebugLogUtil {
  /**
   * generates debug log
   * @param args arguments
   */
  log = (...args: any[]) => {
    const tag =
      process.env.PROJECT +
      '-' +
      process.env.MODULE +
      '-' +
      process.env.ENVIRONMENT;

    debug(tag)(args);
  };
}
