import express from "express";
import updateInvestmentReturn from "../controllers/investmentReturnController.js";
const investmentsReturnRouter = express.Router();

investmentsReturnRouter.post("/:propertyId/:investorId", updateInvestmentReturn);

export default investmentsReturnRouter;
