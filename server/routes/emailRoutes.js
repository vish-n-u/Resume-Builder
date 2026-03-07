import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import {
    initiateGoogleAuth,
    handleGoogleCallback,
    initiateOutlookAuth,
    handleOutlookCallback,
    getEmailStatus,
    disconnectEmail,
    sendApplicationEmail,
} from '../controllers/emailController.js';

const emailRouter = express.Router();

emailRouter.get('/auth/google', protect, initiateGoogleAuth);
emailRouter.get('/auth/google/callback', handleGoogleCallback);
emailRouter.get('/auth/outlook', protect, initiateOutlookAuth);
emailRouter.get('/auth/outlook/callback', handleOutlookCallback);
emailRouter.get('/status', protect, getEmailStatus);
emailRouter.delete('/disconnect', protect, disconnectEmail);
emailRouter.post('/send/:id', protect, sendApplicationEmail);

export default emailRouter;
