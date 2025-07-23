import express from "express";
import { createNewSocial } from "../controllers/social.controller.js";
const socialRouter = express.Router();

socialRouter.post("/", createNewSocial);

export default socialRouter;
