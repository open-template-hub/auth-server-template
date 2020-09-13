import dotenv from 'dotenv'
import cors from 'cors';
import express from 'express';
import { Routes } from './app/routes/index.route';
import bodyParser from 'body-parser';
import { envVariablesCheck } from './app/util/util';
import { configureCronJobs } from './app/services/cron.service';

dotenv.config();

// precondition check
if (!envVariablesCheck()) {
 process.exitCode = 1;
} else {

 // express init
 const app: express.Application = express();

 app.use(bodyParser.urlencoded({extended: false}));

 // parse application/json
 app.use(bodyParser.json())
 app.use(cors());

 Routes.mount(app);

 // listen
 const port: string = process.env.PORT || '4001' as string;

 app.listen(port, () => {
  console.log('Node app is running on port', port);
 });

 // cron
 configureCronJobs();
}
