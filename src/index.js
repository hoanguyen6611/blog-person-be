import express from "express";
import connectDB from "./lib/connectDB.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "./cron/publishJob.js";
import router from "./routes/index.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // hoặc chỉ định cụ thể origin
    credentials: true,
  })
);
app.use(clerkMiddleware());
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/api", router);

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    message: error.message || "Something went wrong",
    status: error.status,
    stack: error.stack,
  });
});

app.listen(3000, () => {
  connectDB();
  console.log("Server is running");
});
