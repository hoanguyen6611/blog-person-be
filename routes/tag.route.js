import express from "express";
import { createNewTag, getAllNameTags } from "../controllers/tag.controller.js";
const router = express.Router();

router.post("/", createNewTag);
router.get("/", getAllNameTags);

export default router;
