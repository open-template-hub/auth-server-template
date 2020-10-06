import { Pool, QueryResult } from 'pg';
import { Builder } from '../util/builder';

export class PostgreSqlProvider {
 private readonly POOL_NOT_INITIALIZED = 'Pool not initialized';
 pool: Pool | null = null;

 builder = new Builder();

 preloadTablesTemplatePath = './assets/sql/preload-tables.psql';

 preload = async () => {
  await this.initConnection();
  let tables = this.builder.buildTemplate(this.preloadTablesTemplatePath);
  return await this.query(tables, []);
 }

 initConnection = async () => {
  this.pool = new Pool({
   connectionString: process.env.DATABASE_URL,
   max: 20,
   application_name: 'AuthServer',
   ssl: {
    rejectUnauthorized: false,
   }
  });
 }

 query = async (text: string, params: Array<any>): Promise<any> => {
  const start = Date.now();
  if (this.pool == null) throw new Error(this.POOL_NOT_INITIALIZED);

  let client = await this.pool.connect();

  return new Promise(function (resolve, reject) {
   client.query(text, params, (err: Error, res: QueryResult<any>) => {
    client.release();
    if (err) {
     console.error(err);
     reject(err);
    } else {
     const duration = Date.now() - start;
     console.log('executed query', {text, duration});
     console.log('res', res);
     resolve(res);
    }
   });
  });
 }
}
