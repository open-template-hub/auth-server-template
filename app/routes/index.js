const authRoute = require('./authRoute');
const socialLoginRoute = require('./socialLoginRoute');
const infoRoute = require('./infoRoute');

module.exports = app => {
    app.use('/auth', authRoute)
    app.use('/social', socialLoginRoute)
    app.use('/info', infoRoute)
};