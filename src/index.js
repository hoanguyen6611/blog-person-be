import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import mainRouter from "./routes/index.js";
import connectDB from "./lib/connectDB.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "./cron/publishJob.js";
import { setupSwagger } from "./config/swagger.js";
import { initSocket } from "./socket-server.js";

const app = express();
const httpServer = createServer(app);

const allowedOrigin = process.env.CLIENT_URL?.replace(/\/+$/, "");
const isLocalhostOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const isOriginAllowed = (origin) =>
  !origin ||
  origin.replace(/\/+$/, "") === allowedOrigin ||
  isLocalhostOrigin(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // Request không có Origin (curl, Postman, server-to-server) luôn được phép.
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(clerkMiddleware());
// Bỏ qua express.json() cho /webhooks vì route webhook cần raw body để verify chữ ký Svix.
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/webhooks")) return next();
  express.json()(req, res, next);
});

app.use("/", mainRouter);
setupSwagger(app);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500);
  res.json({
    message: error.message || "Something went wrong",
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
});

initSocket(httpServer, {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
  console.log(`Document API tại http://localhost:${PORT}/api-docs`);
});
