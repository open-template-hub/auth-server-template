/**
 * @description holds http error interface
 */

export interface HttpError extends Error {
  responseCode: number;
}
