import express from 'express';
import serverless from 'serverless-http';
import dotenv from 'dotenv';

import cors from 'cors';
import router from './property.js';
import eventRouter from './routes/event.js';
import investorRouter from './routes/investor.js';
import investmentRouter from './routes/investments.js';

dotenv.config();
const app = express();

const PORT = 3500;

app.use(cors());
app.use(express.json());

app.use('/api/properties', router);
app.use('/api/event', eventRouter);
app.use('/api/investor', investorRouter);
app.use('/api/investment', investmentRouter);

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});


