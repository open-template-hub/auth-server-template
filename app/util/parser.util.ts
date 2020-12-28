/**
 * @description holds parser util
 */

import objectPath from 'object-path';

export class Parser {
  /**
   * gets json value with path
   * @param json json
   * @param path path
   */
  getJsonValue = (json: any, path: string) => {
    if (!path) {
      return undefined;
    }
    return objectPath.get(json, path);
  };
}
