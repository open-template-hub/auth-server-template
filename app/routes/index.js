const authRoute = require('./authRoute');
const socialLoginRoute = require('./socialLoginRoute');
const infoRoute = require('./infoRoute');
const handle = require('../service/errorHandler');

module.exports = app => {
 app.use('/auth', authRoute);
 app.use('/social', socialLoginRoute);
 app.use('/info', infoRoute);

 // Use for error handling
 app.use(function (err, req, res, next) {
  let error = handle(err);

  console.log(err);
  res.status(error.code).send({message: error.message});
 });

};
