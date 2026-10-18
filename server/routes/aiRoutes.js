import express from "express";
import protect from "../middlewares/authMiddleware.js";
import aiRateLimit from "../middlewares/aiRateLimit.js";
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume, uploadResumeToProfile, tailorResume, tailorResumeStream, suggestJobDescription, handleCustomPrompt, extractJobRequirements, analyzeJobDescription, regenerateSection} from "../controllers/aiController.js";



const aiRouter = express.Router();

aiRouter.use(protect, aiRateLimit)

aiRouter.post('/enhance-pro-sum', enhanceProfessionalSummary)
aiRouter.post('/enhance-job-desc', enhanceJobDescription)
aiRouter.post('/suggest-job-desc', suggestJobDescription)
aiRouter.post('/upload-resume', uploadResume)
aiRouter.post('/upload-resume-to-profile', uploadResumeToProfile)
aiRouter.post('/tailor-resume', tailorResume)
aiRouter.post('/tailor-resume-stream', tailorResumeStream)
aiRouter.post('/custom-prompt', handleCustomPrompt)
aiRouter.post('/extract-job-requirements', extractJobRequirements)
aiRouter.post('/analyze-jd', analyzeJobDescription)
aiRouter.post('/regenerate-section', regenerateSection)

export default aiRouter
