
import { Router } from "express";
import { healthCheckHandler, statusHandler, testRepoHandler } from "../controllers/mainController.js";

const router = Router();

router.get("/", healthCheckHandler);
router.get("/status", statusHandler);
router.get("/test-repo", testRepoHandler);

export default router;
