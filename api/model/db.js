import dotenv from 'dotenv';

dotenv.config();

import { Pool , types} from 'pg';

types.setTypeParser(1082, (value) => value);

const dataBasePool = new Pool({
    connectionString: process.env.DATABASE_URL,
});



export default dataBasePool;