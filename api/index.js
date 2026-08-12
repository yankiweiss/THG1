import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: [
         "http://localhost:5173",
    "http://localhost:3000",
    "https://thg-1.vercel.app"
    ]
}));



import propertyRouter from "./routes/property.js";
import eventRouter from "./routes/event.js";
import investorRouter from "./routes/investor.js";
import investmentsRouter from "./routes/investments.js";
import investmentsReturnRouter from "./routes/investmentReturn.js";
import testRouter from "./routes/test.js";

app.use("/api/properties", propertyRouter);
app.use("/api/investmentReturn", investmentsReturnRouter);
app.use("/api/event", eventRouter);
app.use("/api/investor", investorRouter);
app.use("/api/investments", investmentsRouter);
app.use('/api/test', testRouter)

const PORT = 3000;

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))

export default app;
