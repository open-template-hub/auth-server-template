const authRoute = require('./authRoute');
const socialLoginRoute = require('./socialLoginRoute');
const infoRoute = require('./infoRoute');
const handle = require('../service/errorHandler');
const encryptionService = require('../service/encryptionService');

module.exports = app => {
  const responseInterceptor = (req, res, next) => {
    var originalSend = res.send;
    res.send = function () {
      console.log("Starting Encryption: ", new Date());
      let encrypted_arguments = encryptionService.encrypt(arguments);
      console.log("Encryption Completed: ", new Date());

      originalSend.apply(res, encrypted_arguments);
    };

    next();
  }

  // use this interceptor before routes
  app.use(responseInterceptor);

  app.use('/auth', authRoute);
  app.use('/social', socialLoginRoute);
  app.use('/info', infoRoute);

  // Use for error handling
  app.use(function (err, req, res, next) {
    let error = handle(err);

    console.log(err);
    res.status(error.code).json({ message: error.message });
  });

};
