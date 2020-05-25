/**
 * Error Handler
 */

const ResponseCode = require("../util/constant");

const handle = (exception) => {
  let response = {
    code: ResponseCode.BAD_REQUEST,
    message: exception.message
  };

  if (exception.responseCode) {
    response.code = exception.responseCode;
  }

  return response;
}

module.exports = handle;
