
import { Router } from "express";
import { githubWebhookHandler } from "../controllers/webhookController.js";
import { verifyWebhookSecret } from "../middleware/verifyWebhookSecret.js";

const router = Router();

router.post("/webhook", verifyWebhookSecret, githubWebhookHandler);

export default router;
