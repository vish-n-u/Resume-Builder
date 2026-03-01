import express from "express";
import protect from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminMiddleware.js";
import { getAllUsers, getUserResumes, getResumeById, getUserProfile } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/users", protect, adminOnly, getAllUsers);
adminRouter.get("/users/:userId/resumes", protect, adminOnly, getUserResumes);
adminRouter.get("/users/:userId/profile", protect, adminOnly, getUserProfile);
adminRouter.get("/resumes/:resumeId", protect, adminOnly, getResumeById);

export default adminRouter;
