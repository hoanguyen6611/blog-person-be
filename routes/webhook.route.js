import express from "express";
import { clerkWebHook } from "../controllers/webhookcontroller.js";
import bodyParser from "body-parser";

const router = express.Router();

router.post(
  "/clerk",
  bodyParser.raw({ type: "application/json" }),
  clerkWebHook
);

export default router;
