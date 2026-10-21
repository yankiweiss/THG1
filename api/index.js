import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import authRouter from "./routes/auth.js";
import propertyRouter from "./routes/property.js";
import eventRouter from "./routes/event.js";
import investorRouter from "./routes/investor.js";
import investmentsRouter from "./routes/investments.js";
import investmentsReturnRouter from "./routes/investmentReturn.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://thg-1.vercel.app",
    ],
  }),
);

// Login stays open
app.use("/api/auth", authRouter);

// Everything registered below this line requires an admin login
app.use("/api", requireAuth, requireAdmin);

app.use("/api/properties", propertyRouter);
app.use("/api/investmentReturn", investmentsReturnRouter);
app.use("/api/event", eventRouter);
app.use("/api/investor", investorRouter);
app.use("/api/investments", investmentsRouter);

const PORT = 3000;

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`),
);

export default app;