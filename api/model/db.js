import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();



const dataBasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 1, // critical
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000,
});


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