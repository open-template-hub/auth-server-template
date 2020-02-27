const authRoute = require('./authRoute');

module.exports = app => {
    app.use('/auth', authRoute)
};