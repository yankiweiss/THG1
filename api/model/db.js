import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL environment variable");
}

const dataBasePool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
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
export default dataBasePool;
