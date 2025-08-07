import express from "express";
import mainRouter from "./routes/index.js";
import connectDB from "./lib/connectDB.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "./cron/publishJob.js";
import { setupSwagger } from "./config/swagger.js";

const app = express();

app.use(cors(process.env.CLIENT_URL));
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

app.use("/", mainRouter);
setupSwagger(app);

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
  console.log("Document API tại http://localhost:3000/api-docs");
});
