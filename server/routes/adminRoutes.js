import express from "express";
import protect from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminMiddleware.js";
import { getAllUsers, getUserResumes, getResumeById, getUserProfile, backfillResumeDownloads } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/users", protect, adminOnly, getAllUsers);
adminRouter.get("/users/:userId/resumes", protect, adminOnly, getUserResumes);
adminRouter.get("/users/:userId/profile", protect, adminOnly, getUserProfile);
adminRouter.get("/resumes/:resumeId", protect, adminOnly, getResumeById);
adminRouter.post("/resumes/:resumeId/backfill-downloads", protect, adminOnly, backfillResumeDownloads);

export default adminRouter;
