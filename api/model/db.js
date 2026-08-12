import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

const dataBasePool = new Pool({
  connectionString: process.env.DATABASE_URL
})

dataBasePool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("NEON CONNECTED:", result.rows[0]);
  })
  .catch((error) => {
    console.error("NEON CONNECTION FAILED:", error);
  });

dataBasePool.on("error", (error) => {
  console.error("Postgres pool error:", error);
})





export default dataBasePool;
