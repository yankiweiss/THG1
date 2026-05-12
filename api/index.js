import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

import propertyRouter from "./routes/property.js";
import eventRouter from "./routes/event.js";
import investorRouter from "./routes/investor.js";
import investmentsRouter from "./routes/investments.js";

app.use("/api/properties", propertyRouter);
app.use("/api/event", eventRouter);
app.use("/api/investor", investorRouter);
app.use("/api/investments", investmentsRouter);

const PORT = 3000;

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))

export default app;
