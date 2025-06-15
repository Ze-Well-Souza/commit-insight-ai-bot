
import { Router } from "express";
import { githubWebhookHandler } from "../controllers/webhookController.js";

const router = Router();

router.post("/webhook", githubWebhookHandler);

export default router;
