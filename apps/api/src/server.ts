import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { logger } from "./shared/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
