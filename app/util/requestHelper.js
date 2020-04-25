const request = require("request");

const helper = {
  doGetRequest: async(url) => {
    return new Promise(function (resolve, reject) {
      request(url, function (error, res, body) {
        if (!error) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  }
}

module.exports = helper;