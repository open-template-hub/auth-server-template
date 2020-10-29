/**
 * Error Handler
 */

import { ResponseCode } from '../util/constant';
import { debugLog } from './debug-log.service';

export const handle = (exception) => {
 let response = {
  code: ResponseCode.BAD_REQUEST,
  message: exception.message
 };

 // Overwrite Response Code and Message here
 if (exception.responseCode) {
  response.code = exception.responseCode;
 }

 debugLog(exception);
 console.error(response);

 return response;
}
