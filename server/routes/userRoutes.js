import express from "express";
import { getUserById, getUserResumes, loginUser, registerUser, updateUser, changePassword, getDefaultResumeData, updateDefaultResumeData } from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";
import upload from "../configs/multer.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserById);
userRouter.get('/resumes', protect, getUserResumes);
userRouter.put('/update', protect, updateUser);
userRouter.put('/change-password', protect, changePassword);
userRouter.get('/default-resume-data', protect, getDefaultResumeData);
userRouter.put('/update-default-resume-data', protect, upload.single('image'), updateDefaultResumeData);

export default userRouter;