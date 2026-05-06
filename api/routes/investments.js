import express from "express";
import  getAllInvestments  from "../controllers/investmentsController.js";
const investmentsRouter = express.Router();

investmentsRouter.get("/", getAllInvestments);



export default investmentsRouter;
