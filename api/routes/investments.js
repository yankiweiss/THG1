import express from "express";
import  getAllInvestments  from "../controllers/investmentsController.js";
const investmentsRouter = express.Router();



investmentsRouter.get("/", getAllInvestments);

console.log(getAllInvestments)



export default investmentsRouter;
