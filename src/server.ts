import express from "express";
import routes from "./routes/index";
import http from "http";
import { connectDb } from "./config/db";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/globalErrorHandler";
import { dbStatus } from "./config/db";
import { setUpSocket } from "./sockets";
const app = express();

const server = http.createServer(app);

setUpSocket(server);

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

server.listen(PORT, async () => {
  console.log(`Server running on ${PORT}`);
  connectDb();
});
