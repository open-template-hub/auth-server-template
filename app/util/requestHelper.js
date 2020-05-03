const request = require("request");

const helper = {
  doGetRequest: async(url, headers) => {
    return new Promise(function (resolve, reject) {
      const options = {
        url: url,
        headers: headers
      };
      request(options, function (error, res, body) {
        if (!error) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  },

  doPostRequest: async(url, headers) => {
    return new Promise(function (resolve, reject) {
      const options = {
        url: url,
        headers: headers
      };
      request.post(options, function (error, res, body) {
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