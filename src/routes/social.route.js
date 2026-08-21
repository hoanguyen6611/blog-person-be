import express from "express";
import { createNewSocial } from "../controllers/social.controller.js";
import { requireAuth } from "../middlewares/auth.js";
const socialRouter = express.Router();

socialRouter.post("/", requireAuth, createNewSocial);

export default socialRouter;
