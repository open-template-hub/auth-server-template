export function envVariablesCheck() {
 let valid = true;

 if (!process.env.ACCESS_TOKEN_SECRET) {
  console.error('Please define process.env.ACCESS_TOKEN_SECRET');
  valid = false;
 }

 if (!process.env.REFRESH_TOKEN_SECRET) {
  console.error('Please define process.env.REFRESH_TOKEN_SECRET');
  valid = false;
 }

 if (!process.env.VERIFICATION_TOKEN_SECRET) {
  console.error('Please define process.env.VERIFICATION_TOKEN_SECRET');
  valid = false;
 }

 if (!process.env.RESET_PASSWORD_TOKEN_SECRET) {
  console.error('Please define process.env.RESET_PASSWORD_TOKEN_SECRET');
  valid = false;
 }

 if (!process.env.DATABASE_URL) {
  console.error('Please define process.env.DATABASE_URL');
  valid = false;
 }

 if (!process.env.MAIL_HOST) {
  console.error('Please define process.env.MAIL_HOST');
  valid = false;
 }

 if (!process.env.MAIL_PORT) {
  console.error('Please define process.env.MAIL_PORT');
  valid = false;
 }

 if (!process.env.MAIL_USERNAME) {
  console.error('Please define process.env.MAIL_USERNAME');
  valid = false;
 }

 if (!process.env.MAIL_PASSWORD) {
  console.error('Please define process.env.MAIL_PASSWORD');
  valid = false;
 }

 if (!process.env.CLIENT_URL) {
  console.error('Please define process.env.CLIENT_URL');
  valid = false;
 }

 if (!process.env.CLIENT_VERIFICATION_SUCCESS_URL) {
  console.error('Please define process.env.CLIENT_VERIFICATION_SUCCESS_URL');
  valid = false;
 }

 if (!process.env.CLIENT_RESET_PASSWORD_URL) {
  console.error('Please define process.env.CLIENT_RESET_PASSWORD_URL');
  valid = false;
 }

 return valid;
}

export const roles = {admin: 'ADMIN', userManager: 'USER_MANAGER', user: 'USER'};
