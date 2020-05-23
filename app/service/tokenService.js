const jwt = require('jsonwebtoken');

const service = {
 generateAccessToken: function (user) {
  return jwt.sign({
   username: user.username,
   role: user.role
  }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15minutes'});
 },

 generateRefreshToken: function (user) {
  const token = jwt.sign({
   username: user.username,
   role: user.role
  }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30days'});
  const {exp} = jwt.decode(token);
  return {token: token, exp: exp};
 },

 generateVerificationToken: function (user) {
  return jwt.sign({username: user.username}, process.env.VERIFICATION_TOKEN_SECRET);
 },

 generatePasswordResetToken: function (user) {
  try {
   return jwt.sign({username: user.username}, process.env.RESET_PASSWORD_TOKEN_SECRET + user.password, {expiresIn: '1day'});
  } catch (e) {
   throw e
  }
 },

 verifyAccessToken: function (token) {
  try {
   return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (e) {
   console.error(e);
   if (e.name === 'JsonWebTokenError') {
    e.responseCode = 403;
   } else if (e.name === 'TokenExpiredError') {
    e.responseCode = 401;
   }
   throw e;
  }
 },

 verifyRefreshToken: function (token) {
  try {
   return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (e) {
   console.error(e);
   if (e.name === 'JsonWebTokenError') {
    e.responseCode = 403;
   } else if (e.name === 'TokenExpiredError') {
    e.responseCode = 401;
   }
   throw e;
  }
 },

 verifyVerificationToken: function (token) {
  try {
   return jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
  } catch (e) {
   console.error(e);
   if (e.name === 'JsonWebTokenError') {
    e.responseCode = 403;
   } else if (e.name === 'TokenExpiredError') {
    e.responseCode = 401;
   }
   throw e;
  }
 },

 verifyPasswordResetToken: function (token, currentPassword) {
  try {
   return jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET + currentPassword);
  } catch (e) {
   console.error(e);
   if (e.name === 'JsonWebTokenError') {
    e.responseCode = 403;
   } else if (e.name === 'TokenExpiredError') {
    e.responseCode = 401;
   }
   throw e;
  }
 }
};

module.exports = service;
