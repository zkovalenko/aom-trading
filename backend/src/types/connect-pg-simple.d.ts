declare module 'connect-pg-simple' {
  import { Store } from 'express-session';
  import { Pool } from 'pg';
  
  interface ConnectPgSimpleOptions {
    pool: Pool;
    tableName?: string;
  }
  
  function connectPgSimple(session: any): {
    new (options: ConnectPgSimpleOptions): Store;
  };
  
  export = connectPgSimple;
}