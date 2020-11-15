/**
 * @description holds constants
 */

export const ResponseCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ErrorMessage = {
  FORBIDDEN: 'You do not have right permission to do this operation.',
};

export const TokenDefaults = {
  expire: {
    accessToken: '1hour',
    refreshToken: '30days',
    resetPasswordToken: '1day',
  },
};

export const EmailTemplatePath =
  './assets/mail-templates/verify-account-mail-template.html';