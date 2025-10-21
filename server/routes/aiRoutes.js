import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume, uploadResumeToProfile, tailorResume, suggestJobDescription} from "../controllers/aiController.js";



const aiRouter = express.Router();


aiRouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary)
aiRouter.post('/enhance-job-desc', protect, enhanceJobDescription)
aiRouter.post('/suggest-job-desc', protect, suggestJobDescription)
aiRouter.post('/upload-resume', protect, uploadResume)
aiRouter.post('/upload-resume-to-profile', protect, uploadResumeToProfile)
aiRouter.post('/tailor-resume', protect, tailorResume)

export default aiRouter