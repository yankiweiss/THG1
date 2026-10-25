import express from "express";
import createInvestorUser from "../controllers/userController.js";

const usersRouter = express.Router();

usersRouter.post("/investor", createInvestorUser);

export default usersRouter;