const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const dotenvConfig = dotenv.config();
dotenvExpand(dotenvConfig);

const util = require('./app/util/util.js');
const express = require('express');

const cronService = require('./app/service/cronService.js');
const mountRoutes = require('./app/routes');

// precondition check
if(!util.envVariablesCheck()) {
    return;
}

// express init
const app = express();
app.use(express.json());
mountRoutes(app);

// listen
const port = process.env.PORT || 4000;
const listener = app.listen(port);
console.log('Auth Server Listening on port ' + listener.address().port);

// cron
cronService.configureCronJobs();