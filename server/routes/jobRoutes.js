import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { getJobFeed, dismissJob } from '../controllers/jobController.js';

const jobRouter = express.Router();

jobRouter.get('/feed', protect, getJobFeed);
jobRouter.post('/dismiss', protect, dismissJob);

export default jobRouter;
