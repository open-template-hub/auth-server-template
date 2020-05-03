var objectPath = require("object-path");

const parser = {
  getJsonValue: (json, path) => {
    if (!path) {
      return undefined;
    }
    const data = JSON.parse(json);
    return objectPath.get(data, path);
  }
}

module.exports = parser;