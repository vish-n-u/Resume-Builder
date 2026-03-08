import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { prepareApplication, editApplication, getApplications, applyExternally } from '../controllers/applicationController.js';

const applicationRouter = express.Router();

applicationRouter.post('/prepare', protect, prepareApplication);
applicationRouter.put('/:id/edit', protect, editApplication);
applicationRouter.get('/', protect, getApplications);
applicationRouter.post('/:id/apply-external', protect, applyExternally);

export default applicationRouter;
