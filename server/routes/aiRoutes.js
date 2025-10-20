import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume, tailorResume, suggestJobDescription} from "../controllers/aiController.js";



const aiRouter = express.Router();


aiRouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary)
aiRouter.post('/enhance-job-desc', protect, enhanceJobDescription)
aiRouter.post('/suggest-job-desc', protect, suggestJobDescription)
aiRouter.post('/upload-resume', protect, uploadResume)
aiRouter.post('/tailor-resume', protect, tailorResume)

export default aiRouter