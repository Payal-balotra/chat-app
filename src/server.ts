import express from "express";
import routes from "./routes/index";
import redis from "./utils/redis";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/globalErrorHandler";
import { dbStatus } from "./database/db";
const app = express();
const PORT = 5000;
app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      server: "up",
      database: dbStatus(),
    },
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, async () => {
  // await redis.ping();
  console.log(`Server running on ${PORT}`);
});
