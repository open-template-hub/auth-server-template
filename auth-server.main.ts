import dotenv from 'dotenv'
import cors from 'cors';
import express from 'express';
import { Routes } from './app/routes/index.route';
import bodyParser from 'body-parser';
import { configureCronJobs } from './app/services/cron.service';
import { debugLog } from './app/services/debug-log.service';

// use .env file
const env = dotenv.config();
debugLog(env.parsed);

// express init
const app: express.Application = express();

app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

// mount routes
Routes.mount(app);

// listen port
const port: string = process.env.PORT || '4001' as string;
app.listen(port, () => {
 console.info('Auth Server is running on port: ', port);
});

// cron
configureCronJobs();
