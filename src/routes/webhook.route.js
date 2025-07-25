import express from "express";
import { clerkWebHook } from "../controllers/webhookcontroller.js";
import bodyParser from "body-parser";

const webHookRouter = express.Router();

webHookRouter.post(
  "/clerk",
  bodyParser.raw({ type: "application/json" }),
  clerkWebHook
);

export default webHookRouter;
