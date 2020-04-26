var objectPath = require("object-path");

const parser = {
  getJsonValue: (json, path) => {
    const data = JSON.parse(json);
    return objectPath.get(data, path);
  }
}

module.exports = parser;