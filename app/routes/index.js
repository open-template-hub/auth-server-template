const authRoute = require('./authRoute');
const socialLoginRoute = require('./socialLoginRoute');

module.exports = app => {
    app.use('/auth', authRoute)
    app.use('/social', socialLoginRoute)
};