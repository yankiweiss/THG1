import express from 'express';
import serverless from 'serverless-http';
import dotenv from 'dotenv';

import cors from 'cors';
import router from './routes/property.js';
import eventRouter from './routes/event.js';
import investorRouter from './routes/investor.js';
import investmentRouter from './routes/investments.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/properties', router);
app.use('/api/event', eventRouter);
app.use('/api/investor', investorRouter);
app.use('/api/investment', investmentRouter);

//const PORT =3000;
//
//app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))



export default serverless(app);


