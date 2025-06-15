
import { Router } from "express";
import { getAllAnalysesHandler, getAnalysisByIdHandler, triggerAnalysisHandler } from "../controllers/analysisController.js";
import { healthCheckExtendedHandler, selfTestHandler } from "../controllers/infraController.js";

const router = Router();

router.get("/analyses", getAllAnalysesHandler);
router.get("/analyses/:id", getAnalysisByIdHandler);
router.post("/analyze", triggerAnalysisHandler);

// Novos endpoints:
router.get("/health", healthCheckExtendedHandler);
router.get("/selftest", selfTestHandler);

export default router;
