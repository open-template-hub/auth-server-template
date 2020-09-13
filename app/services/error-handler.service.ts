/**
 * Error Handler
 */

import { ResponseCode } from '../util/constant';

export const handle = (exception) => {
 let response = {
  code: ResponseCode.BAD_REQUEST,
  message: exception.message
 };

 // Overwrite Response Code and Message here
 if (exception.responseCode) {
  response.code = exception.responseCode;
 }

 return response;
}
