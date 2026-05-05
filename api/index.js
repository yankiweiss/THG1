import express from 'express';
import serverless from 'serverless-http';
import dotenv from 'dotenv';

import cors from 'cors';
import router from '../server/routes/api/property.js';
import eventRouter from '../server/routes/api/event.js';
import investorRouter from '../server/routes/api/investments.js';
import investmentRouter from '../server/routes/api/investments.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/properties', router);
app.use('/api/event', eventRouter);
app.use('/api/investor', investorRouter);
app.use('/api/investment', investmentRouter);

export default serverless(app);


