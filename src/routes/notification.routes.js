import express from "express";
import { getNotificationsByUser } from "../controllers/notification.controller.js";
const router = express.Router();

router.get("/", getNotificationsByUser);

export default router;
