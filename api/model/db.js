import { Pool } from "pg";

const dataBasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,              // IMPORTANT for serverless
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000,
});

export default dataBasePool;


//import dotenv from 'dotenv';
//
//dotenv.config();
//
//import { Pool , types} from 'pg';
//
//types.setTypeParser(1082, (value) => value);
//
//const dataBasePool = new Pool({
//    connectionString: process.env.DATABASE_URL,
//});
//
//
//
//export default dataBasePool;