/**
 * @description holds Postgresql connection provider
 */

import { Pool, QueryResult } from 'pg';
import { BuilderUtil } from '../util/builder.util';
import { DebugLogUtil } from '../util/debug-log.util';

export class PostgreSqlProvider {
  constructor(
    private connectionPool: Pool = new Pool(),
    private currentPoolLimit: number = 1,
    private debugLogUtil: DebugLogUtil = new DebugLogUtil()
  ) {}

  builder = new BuilderUtil();

  preloadTablesTemplatePath = './assets/sql/preload.tables.psql';

  /**
   * preloads connection provider
   */
  preload = async () => {
    this.currentPoolLimit = process.env.POSTGRESQL_CONNECTION_LIMIT
      ? parseInt(process.env.POSTGRESQL_CONNECTION_LIMIT)
      : 1;

    // Creating Connection Pool
    this.connectionPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      application_name: 'PaymentServer',
      max: this.currentPoolLimit,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    let queries = this.builder.buildTemplateFromFile(
      this.preloadTablesTemplatePath
    );
    return await this.query(queries, []);
  };

  /**
   * queries db
   * @param text query
   * @param params query parameters
   */
  query = async (text: string, params: Array<any>): Promise<any> => {
    const start = Date.now();

    const connectionPool = this.connectionPool;
    const debugLogUtil = this.debugLogUtil;

    return new Promise(function (resolve, reject) {
      connectionPool.query(
        text,
        params,
        (err: Error, res: QueryResult<any>) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debugLogUtil.log('executed query', {
              sql: text,
              duration: Date.now() - start,
              result: res,
            });
            resolve(res);
          }
        }
      );
    });
  };
}
