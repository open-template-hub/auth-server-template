import objectPath from 'object-path';

export class Parser {
  getJsonValue = (json, path) => {
    if (!path) {
      return undefined;
    }
    return objectPath.get(json, path);
  };
}
