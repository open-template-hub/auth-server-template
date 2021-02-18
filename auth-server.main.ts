/**
 * @description holds server main
 */

import { DebugLogUtil, UsageUtil } from '@open-template-hub/common';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Routes } from './app/route/index.route';

const debugLogUtil = new DebugLogUtil();

const env = dotenv.config();
debugLogUtil.log( env.parsed );

// express init
const app: express.Application = express();

// public files
app.use( express.static( 'public' ) );

// parse application/json
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( bodyParser.json() );
app.use( cors() );

// mount routes
Routes.mount( app );

// listen port
const port: string = process.env.PORT || ( '4001' as string );

app.listen( port, () => {
  console.info( 'Auth Server is running on port', port );

  const usageUtil = new UsageUtil();
  const memoryUsage = usageUtil.getMemoryUsage();
  console.info( `Startup Memory Usage: ${ memoryUsage.toFixed( 2 ) } MB` );
} );
