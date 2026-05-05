import express from 'express';
import { getAllInvestments } from '../../controllers/invesmentsController.js';
const investmentRouter = express.Router();


investmentRouter.get('/',getAllInvestments)

export default investmentRouter;