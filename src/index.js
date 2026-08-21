import express from "express";
import mainRouter from "./routes/index.js";
import connectDB from "./lib/connectDB.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "./cron/publishJob.js";
import { setupSwagger } from "./config/swagger.js";

const app = express();

const allowedOrigin = process.env.CLIENT_URL?.replace(/\/+$/, "");
const isLocalhostOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // Request không có Origin (curl, Postman, server-to-server) luôn được phép.
      if (!origin) return callback(null, true);
      if (origin.replace(/\/+$/, "") === allowedOrigin || isLocalhostOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
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

app.listen(3000, () => {
  connectDB();
  console.log("Server is running");
  console.log("Document API tại http://localhost:3000/api-docs");
});
