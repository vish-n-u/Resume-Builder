import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { prepareApplication, editApplication, getApplications } from '../controllers/applicationController.js';

const applicationRouter = express.Router();

applicationRouter.post('/prepare', protect, prepareApplication);
applicationRouter.put('/:id/edit', protect, editApplication);
applicationRouter.get('/', protect, getApplications);

export default applicationRouter;
