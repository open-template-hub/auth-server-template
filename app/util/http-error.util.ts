export interface HttpError extends Error {
  responseCode: number;
}
