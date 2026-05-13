import express from "express";
import testApi from "../controllers/test.js";
const testRouter = express.Router();

testRouter.get("/", testApi);

export default testRouter;
