
import { Router } from "express";
import { getAllAnalysesHandler, getAnalysisByIdHandler, triggerAnalysisHandler } from "../controllers/analysisController.js";

const router = Router();

router.get("/analyses", getAllAnalysesHandler);
router.get("/analyses/:id", getAnalysisByIdHandler);
router.post("/analyze", triggerAnalysisHandler);

export default router;
