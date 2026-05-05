import express from 'express';
import { addingInvestorToProp, getInvestorByID, updateInvestorField } from '../../controllers/investorController.js';

const investorRouter = express.Router();

investorRouter.get('/:propertyId/:investorId', getInvestorByID).post('/addInvestor', addingInvestorToProp).put('/:id', updateInvestorField)





export default investorRouter;