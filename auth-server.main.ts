/**
 * @description holds server main
 */
import dotenv from 'dotenv';
import cors from 'cors';
import { Routes } from './app/route/index.route';
import express = require('express');
import bodyParser = require('body-parser');
import { debugLog } from './app/util/debug-log.util';
import { configureCronJobs } from './app/util/cron.util';

const env = dotenv.config();
debugLog(env.parsed);

// express init
const app: express.Application = express();

// public files
app.use(express.static('public'));

// parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// mount routes
Routes.mount(app);

// listen port
const port: string = process.env.PORT || ('4001' as string);
app.listen(port, () => {
  console.info('Auth Server is running on port', port);
});

// cron
configureCronJobs();
