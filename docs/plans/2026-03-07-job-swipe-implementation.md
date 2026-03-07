# Job Swipe Feature - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Tinder-style job swiping UI where users swipe through personalized job cards, and right-swiping generates a tailored resume + cover letter email that the user can edit and send via connected Gmail/Outlook.

**Architecture:** New modules (models, controllers, routes, pages, components, Redux slices) bolted onto the existing Express + React + MongoDB stack. Jobs fetched from JSearch API, personalized by user's resume data. OAuth for Gmail/Outlook email sending. Client-side PDF via html2canvas + jspdf.

**Tech Stack:** React 19, Redux Toolkit, Tailwind CSS v4, Express 5, Mongoose, OpenAI, JSearch (RapidAPI), googleapis, @azure/msal-node, @microsoft/microsoft-graph-client, react-tinder-card, html2canvas, jspdf (existing)

---

## Task 1: Install Dependencies

**Files:**
- Modify: `server/package.json`
- Modify: `client/package.json`

**Step 1: Install server dependencies**

```bash
cd server
npm install googleapis @azure/msal-node @microsoft/microsoft-graph-client
```

**Step 2: Install client dependencies**

```bash
cd client
npm install react-tinder-card html2canvas
```

**Step 3: Commit**

```bash
git add server/package.json server/package-lock.json client/package.json client/package-lock.json
git commit -m "feat: add dependencies for job swipe feature"
```

---

## Task 2: Create Server Models (Job, Application) & Update User Model

**Files:**
- Create: `server/models/Job.js`
- Create: `server/models/Application.js`
- Modify: `server/models/User.js`

**Step 1: Create Job model**

Create `server/models/Job.js`:

```js
import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    externalId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: '' },
    type: { type: String, default: '' },
    salary: { type: String, default: '' },
    description: { type: String, default: '' },
    skills: [{ type: String }],
    applyUrl: { type: String, default: '' },
    applyEmail: { type: String, default: '' },
    postedDate: { type: Date },
    source: { type: String, default: 'jsearch' },
    fetchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Job = mongoose.model('Job', JobSchema);

export default Job;
```

**Step 2: Create Application model**

Create `server/models/Application.js`:

```js
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    emailSubject: { type: String, default: '' },
    emailBody: { type: String, default: '' },
    recipientEmail: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'sent', 'failed'], default: 'draft' },
    sentAt: { type: Date },
}, { timestamps: true });

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;
```

**Step 3: Update User model with OAuth fields and dismissedJobs**

Modify `server/models/User.js` - add these fields to the schema:

```js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
    name: {type: String, required: true },
    email: {type: String, required: true, unique: true },
    password: {type: String, required: true },
    emailProvider: { type: String, enum: ['gmail', 'outlook', 'none'], default: 'none' },
    oauthTokens: {
        accessToken: { type: String, default: '' },
        refreshToken: { type: String, default: '' },
        expiresAt: { type: Date },
    },
    dismissedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
}, {timestamps: true })

UserSchema.methods.comparePassword = function (password){
    return bcrypt.compareSync(password, this.password)
}

const User = mongoose.model("User", UserSchema)

export default User;
```

**Step 4: Commit**

```bash
git add server/models/Job.js server/models/Application.js server/models/User.js
git commit -m "feat: add Job, Application models and update User with OAuth fields"
```

---

## Task 3: Create Job Controller & Routes (JSearch API Integration)

**Files:**
- Create: `server/controllers/jobController.js`
- Create: `server/routes/jobRoutes.js`
- Modify: `server/server.js`

**Step 1: Create job controller**

Create `server/controllers/jobController.js`:

```js
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import DetailedResume from "../models/DetailedResume.js";
import User from "../models/User.js";

// GET /api/jobs/feed - Fetch personalized job feed
export const getJobFeed = async (req, res) => {
    try {
        const userId = req.userId;

        // Get user's resume data for personalization
        const detailedResume = await DetailedResume.findOne({ userId });
        if (!detailedResume) {
            return res.status(400).json({ message: "Please fill in your resume data first to get job suggestions." });
        }

        // Build search query from user's skills and profession
        const skills = detailedResume.skills || [];
        const profession = detailedResume.personal_info?.profession || '';
        const location = detailedResume.personal_info?.location || '';

        const searchQuery = profession || skills.slice(0, 3).join(' ');

        if (!searchQuery) {
            return res.status(400).json({ message: "Please add your profession or skills to get job suggestions." });
        }

        // Get user's dismissed and applied job IDs to filter them out
        const user = await User.findById(userId);
        const dismissedJobIds = user.dismissedJobs || [];

        const appliedApplications = await Application.find({ userId }).select('jobId');
        const appliedJobIds = appliedApplications.map(app => app.jobId);

        const excludeJobIds = [...dismissedJobIds, ...appliedJobIds];

        // Fetch from JSearch API
        const page = parseInt(req.query.page) || 1;

        const response = await fetch(
            `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery + (location ? ' in ' + location : ''))}&page=${page}&num_pages=1`,
            {
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                    'x-rapidapi-host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com',
                },
            }
        );

        const apiData = await response.json();

        if (!apiData.data || apiData.data.length === 0) {
            return res.json({ jobs: [], message: "No jobs found. Try updating your skills or profession." });
        }

        // Cache jobs in DB and filter out dismissed/applied
        const jobs = [];
        for (const item of apiData.data) {
            const jobData = {
                externalId: item.job_id,
                title: item.job_title || '',
                company: item.employer_name || '',
                location: item.job_city ? `${item.job_city}, ${item.job_state || ''}, ${item.job_country || ''}` : (item.job_country || 'Remote'),
                type: item.job_is_remote ? 'remote' : 'onsite',
                salary: item.job_min_salary && item.job_max_salary
                    ? `$${item.job_min_salary} - $${item.job_max_salary}`
                    : '',
                description: item.job_description || '',
                skills: item.job_required_skills || [],
                applyUrl: item.job_apply_link || '',
                applyEmail: item.job_apply_quality_score ? '' : '', // JSearch doesn't always have email
                postedDate: item.job_posted_at_datetime_utc ? new Date(item.job_posted_at_datetime_utc) : new Date(),
                source: 'jsearch',
                fetchedAt: new Date(),
            };

            // Upsert job into DB
            const job = await Job.findOneAndUpdate(
                { externalId: jobData.externalId },
                jobData,
                { upsert: true, new: true }
            );

            // Only include if not dismissed/applied
            if (!excludeJobIds.some(id => id.toString() === job._id.toString())) {
                jobs.push(job);
            }
        }

        res.json({ jobs });
    } catch (error) {
        console.error("Error fetching job feed:", error);
        res.status(500).json({ message: "Failed to fetch jobs" });
    }
};

// POST /api/jobs/dismiss - Dismiss a job (left swipe)
export const dismissJob = async (req, res) => {
    try {
        const userId = req.userId;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        await User.findByIdAndUpdate(userId, {
            $addToSet: { dismissedJobs: jobId }
        });

        res.json({ message: "Job dismissed" });
    } catch (error) {
        console.error("Error dismissing job:", error);
        res.status(500).json({ message: "Failed to dismiss job" });
    }
};
```

**Step 2: Create job routes**

Create `server/routes/jobRoutes.js`:

```js
import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { getJobFeed, dismissJob } from '../controllers/jobController.js';

const jobRouter = express.Router();

jobRouter.get('/feed', protect, getJobFeed);
jobRouter.post('/dismiss', protect, dismissJob);

export default jobRouter;
```

**Step 3: Register routes in server.js**

Add to `server/server.js` after the existing route imports:

```js
import jobRouter from "./routes/jobRoutes.js";
```

And add the route:

```js
app.use('/api/jobs', jobRouter)
```

**Step 4: Commit**

```bash
git add server/controllers/jobController.js server/routes/jobRoutes.js server/server.js
git commit -m "feat: add job feed endpoint with JSearch API integration"
```

---

## Task 4: Create Application Controller & Routes (AI + CRUD)

**Files:**
- Create: `server/controllers/applicationController.js`
- Create: `server/routes/applicationRoutes.js`
- Modify: `server/server.js`

**Step 1: Create application controller**

Create `server/controllers/applicationController.js`:

```js
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import DetailedResume from "../models/DetailedResume.js";
import ai from "../configs/ai.js";

// POST /api/applications/prepare - Right swipe: generate tailored resume + email
export const prepareApplication = async (req, res) => {
    try {
        const userId = req.userId;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Get user's detailed resume data
        const detailedResume = await DetailedResume.findOne({ userId });
        if (!detailedResume) {
            return res.status(400).json({ message: "Please fill in your resume data first." });
        }

        // Prepare user profile summary for AI
        const userProfile = {
            name: detailedResume.personal_info?.full_name || '',
            profession: detailedResume.personal_info?.profession || '',
            email: detailedResume.personal_info?.email || '',
            skills: detailedResume.skills || [],
            experience: detailedResume.experience || [],
            education: detailedResume.education || [],
            summary: detailedResume.professional_summary || '',
            projects: detailedResume.project || [],
        };

        const userPreferences = detailedResume.preferences || {};

        // Generate tailored resume + email via AI
        const systemPrompt = `You are an expert career coach and resume writer. You will receive a candidate's profile and a job description. You must:

1. Tailor the candidate's professional summary to align with the job requirements
2. Write a concise application email (under 200 words) introducing the candidate for the role

USER PREFERENCES:
- Writing Style: ${userPreferences.writing_style || 'professional'}
- Tone: ${userPreferences.tone || 'confident'}
${userPreferences.custom_requirements ? `\nCUSTOM REQUIREMENTS: ${userPreferences.custom_requirements}\n` : ''}

Respond in this exact JSON format:
{
    "tailored_summary": "The tailored professional summary",
    "email_subject": "Application for [Job Title] at [Company]",
    "email_body": "The application email body"
}

Only return valid JSON. No markdown, no code blocks.`;

        const userMessage = `CANDIDATE PROFILE:
Name: ${userProfile.name}
Profession: ${userProfile.profession}
Skills: ${userProfile.skills.join(', ')}
Experience: ${userProfile.experience.map(e => `${e.position} at ${e.company}`).join('; ')}
Education: ${userProfile.education.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join('; ')}
Summary: ${userProfile.summary}

JOB DESCRIPTION:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}`;

        const aiResponse = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
        });

        let aiResult;
        try {
            aiResult = JSON.parse(aiResponse.choices[0].message.content);
        } catch {
            return res.status(500).json({ message: "AI generated invalid response. Please try again." });
        }

        // Create a tailored resume in the DB (copy from detailed resume with tailored summary)
        const tailoredResume = await Resume.create({
            userId,
            title: `${job.title} at ${job.company}`,
            job_description: job.description,
            professional_summary: aiResult.tailored_summary,
            skills: detailedResume.skills,
            personal_info: detailedResume.personal_info,
            experience: detailedResume.experience,
            project: detailedResume.project,
            education: detailedResume.education,
            certifications: detailedResume.certifications,
            achievements: detailedResume.achievements,
            custom_sections: detailedResume.custom_sections,
        });

        // Create application record
        const application = await Application.create({
            userId,
            jobId: job._id,
            resumeId: tailoredResume._id,
            emailSubject: aiResult.email_subject,
            emailBody: aiResult.email_body,
            recipientEmail: job.applyEmail || '',
            status: 'draft',
        });

        res.json({
            application,
            resume: tailoredResume,
            job,
        });
    } catch (error) {
        console.error("Error preparing application:", error);
        res.status(500).json({ message: "Failed to prepare application" });
    }
};

// PUT /api/applications/:id/edit - Edit application before sending
export const editApplication = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { emailSubject, emailBody, recipientEmail } = req.body;

        const application = await Application.findOne({ _id: id, userId });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (emailSubject !== undefined) application.emailSubject = emailSubject;
        if (emailBody !== undefined) application.emailBody = emailBody;
        if (recipientEmail !== undefined) application.recipientEmail = recipientEmail;

        await application.save();

        res.json({ application });
    } catch (error) {
        console.error("Error editing application:", error);
        res.status(500).json({ message: "Failed to edit application" });
    }
};

// GET /api/applications - List all applications for the user
export const getApplications = async (req, res) => {
    try {
        const userId = req.userId;
        const applications = await Application.find({ userId })
            .populate('jobId')
            .sort({ createdAt: -1 });

        res.json({ applications });
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
};
```

**Step 2: Create application routes**

Create `server/routes/applicationRoutes.js`:

```js
import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { prepareApplication, editApplication, getApplications } from '../controllers/applicationController.js';

const applicationRouter = express.Router();

applicationRouter.post('/prepare', protect, prepareApplication);
applicationRouter.put('/:id/edit', protect, editApplication);
applicationRouter.get('/', protect, getApplications);

export default applicationRouter;
```

**Step 3: Register routes in server.js**

Add import and route to `server/server.js`:

```js
import applicationRouter from "./routes/applicationRoutes.js";
// ...
app.use('/api/applications', applicationRouter)
```

**Step 4: Commit**

```bash
git add server/controllers/applicationController.js server/routes/applicationRoutes.js server/server.js
git commit -m "feat: add application controller with AI resume tailoring and email generation"
```

---

## Task 5: Create OAuth Email Controller & Routes

**Files:**
- Create: `server/controllers/emailController.js`
- Create: `server/routes/emailRoutes.js`
- Modify: `server/server.js`

**Step 1: Create email controller**

Create `server/controllers/emailController.js`:

```js
import { google } from 'googleapis';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import User from '../models/User.js';
import Application from '../models/Application.js';

// --- Google OAuth ---

const getGoogleOAuthClient = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

// GET /api/email/auth/google
export const initiateGoogleAuth = (req, res) => {
    const oauth2Client = getGoogleOAuthClient();
    const scopes = ['https://www.googleapis.com/auth/gmail.send'];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: req.userId, // pass userId to callback
    });

    res.json({ authUrl });
};

// GET /api/email/auth/google/callback
export const handleGoogleCallback = async (req, res) => {
    try {
        const { code, state: userId } = req.query;
        const oauth2Client = getGoogleOAuthClient();

        const { tokens } = await oauth2Client.getToken(code);

        await User.findByIdAndUpdate(userId, {
            emailProvider: 'gmail',
            oauthTokens: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(tokens.expiry_date),
            },
        });

        // Redirect back to the app settings page
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/app/profile?emailConnected=true`);
    } catch (error) {
        console.error("Google OAuth callback error:", error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/app/profile?emailError=true`);
    }
};

// --- Microsoft OAuth ---

const getMsalClient = () => {
    return new ConfidentialClientApplication({
        auth: {
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            authority: 'https://login.microsoftonline.com/common',
        },
    });
};

// GET /api/email/auth/outlook
export const initiateOutlookAuth = async (req, res) => {
    const msalClient = getMsalClient();

    const authUrl = await msalClient.getAuthCodeUrl({
        scopes: ['Mail.Send'],
        redirectUri: process.env.MICROSOFT_REDIRECT_URI,
        state: req.userId,
    });

    res.json({ authUrl });
};

// GET /api/email/auth/outlook/callback
export const handleOutlookCallback = async (req, res) => {
    try {
        const { code, state: userId } = req.query;
        const msalClient = getMsalClient();

        const tokenResponse = await msalClient.acquireTokenByCode({
            code,
            scopes: ['Mail.Send'],
            redirectUri: process.env.MICROSOFT_REDIRECT_URI,
        });

        await User.findByIdAndUpdate(userId, {
            emailProvider: 'outlook',
            oauthTokens: {
                accessToken: tokenResponse.accessToken,
                refreshToken: '', // MSAL handles refresh internally via cache
                expiresAt: tokenResponse.expiresOn,
            },
        });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/app/profile?emailConnected=true`);
    } catch (error) {
        console.error("Outlook OAuth callback error:", error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/app/profile?emailError=true`);
    }
};

// --- Email Status & Disconnect ---

// GET /api/email/status
export const getEmailStatus = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('emailProvider oauthTokens');
        res.json({
            connected: user.emailProvider !== 'none' && !!user.oauthTokens?.accessToken,
            provider: user.emailProvider,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to get email status" });
    }
};

// DELETE /api/email/disconnect
export const disconnectEmail = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            emailProvider: 'none',
            oauthTokens: { accessToken: '', refreshToken: '', expiresAt: null },
        });
        res.json({ message: "Email disconnected" });
    } catch (error) {
        res.status(500).json({ message: "Failed to disconnect email" });
    }
};

// --- Send Email ---

// Helper: Build MIME message for Gmail
const buildMimeMessage = (to, from, subject, body, pdfBuffer, pdfFilename) => {
    const boundary = 'boundary_' + Date.now();
    const mimeMessage = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        body,
        '',
        `--${boundary}`,
        `Content-Type: application/pdf; name="${pdfFilename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${pdfFilename}"`,
        '',
        pdfBuffer.toString('base64'),
        '',
        `--${boundary}--`,
    ].join('\r\n');

    return Buffer.from(mimeMessage).toString('base64url');
};

// POST /api/applications/:id/send
export const sendApplicationEmail = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const application = await Application.findOne({ _id: id, userId });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (!application.recipientEmail) {
            return res.status(400).json({ message: "Recipient email is required" });
        }

        const user = await User.findById(userId);
        if (!user.oauthTokens?.accessToken) {
            return res.status(400).json({ message: "Please connect your email first" });
        }

        // Get PDF from request (uploaded as base64)
        const { pdfBase64 } = req.body;
        if (!pdfBase64) {
            return res.status(400).json({ message: "Resume PDF is required" });
        }

        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        const pdfFilename = `${application.emailSubject.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;

        if (user.emailProvider === 'gmail') {
            // Send via Gmail API
            const oauth2Client = getGoogleOAuthClient();
            oauth2Client.setCredentials({
                access_token: user.oauthTokens.accessToken,
                refresh_token: user.oauthTokens.refreshToken,
            });

            // Refresh token if expired
            if (new Date() >= new Date(user.oauthTokens.expiresAt)) {
                const { credentials } = await oauth2Client.refreshAccessToken();
                await User.findByIdAndUpdate(userId, {
                    'oauthTokens.accessToken': credentials.access_token,
                    'oauthTokens.expiresAt': new Date(credentials.expiry_date),
                });
                oauth2Client.setCredentials(credentials);
            }

            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
            const rawMessage = buildMimeMessage(
                application.recipientEmail,
                user.email,
                application.emailSubject,
                application.emailBody,
                pdfBuffer,
                pdfFilename
            );

            await gmail.users.messages.send({
                userId: 'me',
                requestBody: { raw: rawMessage },
            });

        } else if (user.emailProvider === 'outlook') {
            // Send via Microsoft Graph
            const client = Client.init({
                authProvider: (done) => {
                    done(null, user.oauthTokens.accessToken);
                },
            });

            await client.api('/me/sendMail').post({
                message: {
                    subject: application.emailSubject,
                    body: { contentType: 'Text', content: application.emailBody },
                    toRecipients: [{ emailAddress: { address: application.recipientEmail } }],
                    attachments: [{
                        '@odata.type': '#microsoft.graph.fileAttachment',
                        name: pdfFilename,
                        contentType: 'application/pdf',
                        contentBytes: pdfBase64,
                    }],
                },
            });
        } else {
            return res.status(400).json({ message: "No email provider connected" });
        }

        // Update application status
        application.status = 'sent';
        application.sentAt = new Date();
        await application.save();

        res.json({ message: "Application sent successfully!", application });
    } catch (error) {
        console.error("Error sending email:", error);

        // Update application status to failed
        try {
            await Application.findByIdAndUpdate(req.params.id, { status: 'failed' });
        } catch {}

        res.status(500).json({ message: "Failed to send email. Please check your email connection." });
    }
};
```

**Step 2: Create email routes**

Create `server/routes/emailRoutes.js`:

```js
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

// OAuth flows (initiate needs auth, callbacks don't)
emailRouter.get('/auth/google', protect, initiateGoogleAuth);
emailRouter.get('/auth/google/callback', handleGoogleCallback);
emailRouter.get('/auth/outlook', protect, initiateOutlookAuth);
emailRouter.get('/auth/outlook/callback', handleOutlookCallback);

// Email status
emailRouter.get('/status', protect, getEmailStatus);
emailRouter.delete('/disconnect', protect, disconnectEmail);

// Send (also under applications, but routed here for email logic)
emailRouter.post('/send/:id', protect, sendApplicationEmail);

export default emailRouter;
```

**Step 3: Register routes in server.js**

Add import and route to `server/server.js`:

```js
import emailRouter from "./routes/emailRoutes.js";
// ...
app.use('/api/email', emailRouter)
```

**Step 4: Commit**

```bash
git add server/controllers/emailController.js server/routes/emailRoutes.js server/server.js
git commit -m "feat: add OAuth email controller with Gmail and Outlook support"
```

---

## Task 6: Create Redux Slices (jobsSlice, applicationsSlice)

**Files:**
- Create: `client/src/app/features/jobsSlice.js`
- Create: `client/src/app/features/applicationsSlice.js`
- Modify: `client/src/app/store.js`

**Step 1: Create jobs slice**

Create `client/src/app/features/jobsSlice.js`:

```js
import { createSlice } from "@reduxjs/toolkit";

const jobsSlice = createSlice({
    name: 'jobs',
    initialState: {
        feed: [],
        loading: false,
        error: null,
    },
    reducers: {
        setJobs: (state, action) => {
            state.feed = action.payload;
            state.loading = false;
            state.error = null;
        },
        addJobs: (state, action) => {
            state.feed = [...state.feed, ...action.payload];
            state.loading = false;
        },
        removeJob: (state, action) => {
            state.feed = state.feed.filter(job => job._id !== action.payload);
        },
        setJobsLoading: (state, action) => {
            state.loading = action.payload;
        },
        setJobsError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    }
});

export const { setJobs, addJobs, removeJob, setJobsLoading, setJobsError } = jobsSlice.actions;

export default jobsSlice.reducer;
```

**Step 2: Create applications slice**

Create `client/src/app/features/applicationsSlice.js`:

```js
import { createSlice } from "@reduxjs/toolkit";

const applicationsSlice = createSlice({
    name: 'applications',
    initialState: {
        list: [],
        currentApplication: null,
        loading: false,
    },
    reducers: {
        setApplications: (state, action) => {
            state.list = action.payload;
            state.loading = false;
        },
        setCurrentApplication: (state, action) => {
            state.currentApplication = action.payload;
        },
        clearCurrentApplication: (state) => {
            state.currentApplication = null;
        },
        setApplicationsLoading: (state, action) => {
            state.loading = action.payload;
        },
        updateApplicationStatus: (state, action) => {
            const { id, status } = action.payload;
            const app = state.list.find(a => a._id === id);
            if (app) app.status = status;
        },
    }
});

export const {
    setApplications,
    setCurrentApplication,
    clearCurrentApplication,
    setApplicationsLoading,
    updateApplicationStatus,
} = applicationsSlice.actions;

export default applicationsSlice.reducer;
```

**Step 3: Update store**

Modify `client/src/app/store.js`:

```js
import {configureStore} from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import jobsReducer from './features/jobsSlice'
import applicationsReducer from './features/applicationsSlice'

export const store = configureStore({
    reducer : {
        auth: authReducer,
        jobs: jobsReducer,
        applications: applicationsReducer,
    }
})
```

**Step 4: Commit**

```bash
git add client/src/app/features/jobsSlice.js client/src/app/features/applicationsSlice.js client/src/app/store.js
git commit -m "feat: add Redux slices for jobs feed and applications"
```

---

## Task 7: Create JobCard Component

**Files:**
- Create: `client/src/components/JobCard.jsx`

**Step 1: Create the job card component**

Create `client/src/components/JobCard.jsx`:

```jsx
import React from 'react'
import { MapPin, Building2, Clock, DollarSign, Briefcase } from 'lucide-react'

const JobCard = ({ job }) => {
  return (
    <div className='w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col'>
      {/* Header */}
      <div className='p-6 pb-4'>
        <div className='flex items-start gap-4'>
          <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0'>
            {job.company?.charAt(0) || '?'}
          </div>
          <div className='min-w-0'>
            <h2 className='text-xl font-bold text-gray-900 leading-tight'>{job.title}</h2>
            <p className='text-blue-600 font-semibold mt-1 flex items-center gap-1.5'>
              <Building2 className='size-4' />
              {job.company}
            </p>
          </div>
        </div>
      </div>

      {/* Meta tags */}
      <div className='px-6 flex flex-wrap gap-2'>
        {job.location && (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full'>
            <MapPin className='size-3' />
            {job.location}
          </span>
        )}
        {job.type && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${
            job.type === 'remote' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            <Briefcase className='size-3' />
            {job.type}
          </span>
        )}
        {job.salary && (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full'>
            <DollarSign className='size-3' />
            {job.salary}
          </span>
        )}
      </div>

      {/* Description */}
      <div className='px-6 py-4 flex-1 overflow-y-auto'>
        <p className='text-sm text-gray-600 leading-relaxed line-clamp-[12]'>
          {job.description?.substring(0, 600)}{job.description?.length > 600 ? '...' : ''}
        </p>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className='px-6 pb-4'>
          <div className='flex flex-wrap gap-1.5'>
            {job.skills.slice(0, 6).map((skill, i) => (
              <span key={i} className='text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium'>
                {skill}
              </span>
            ))}
            {job.skills.length > 6 && (
              <span className='text-xs text-gray-400 px-2 py-1'>+{job.skills.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {/* Posted date */}
      <div className='px-6 pb-5'>
        <p className='text-xs text-gray-400 flex items-center gap-1'>
          <Clock className='size-3' />
          {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Recently posted'}
        </p>
      </div>
    </div>
  )
}

export default JobCard
```

**Step 2: Commit**

```bash
git add client/src/components/JobCard.jsx
git commit -m "feat: add JobCard component for swipe UI"
```

---

## Task 8: Create SwipeContainer Component

**Files:**
- Create: `client/src/components/SwipeContainer.jsx`

**Step 1: Create the swipe container**

Create `client/src/components/SwipeContainer.jsx`:

```jsx
import React, { useState, useRef, useMemo } from 'react'
import TinderCard from 'react-tinder-card'
import JobCard from './JobCard'
import { X, Heart, RotateCcw } from 'lucide-react'

const SwipeContainer = ({ jobs, onSwipeLeft, onSwipeRight, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(jobs.length - 1)
  const currentIndexRef = useRef(currentIndex)

  const childRefs = useMemo(
    () => Array(jobs.length).fill(0).map(() => React.createRef()),
    [jobs.length]
  )

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val)
    currentIndexRef.current = val
  }

  const canSwipe = currentIndex >= 0

  const swiped = (direction, job, index) => {
    updateCurrentIndex(index - 1)
    if (direction === 'left') {
      onSwipeLeft(job)
    } else if (direction === 'right') {
      onSwipeRight(job)
    }
  }

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < jobs.length) {
      await childRefs[currentIndex].current.swipe(dir)
    }
  }

  // Reset when jobs change
  React.useEffect(() => {
    updateCurrentIndex(jobs.length - 1)
  }, [jobs.length])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[500px]'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-500 text-lg'>Finding jobs for you...</p>
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className='flex items-center justify-center h-[500px]'>
        <div className='text-center px-4'>
          <Briefcase className='size-16 text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500 text-xl font-medium'>No more jobs to show</p>
          <p className='text-gray-400 mt-2'>Check back later or update your profile for better matches</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center'>
      {/* Card stack */}
      <div className='relative w-full max-w-sm h-[520px] sm:h-[560px]'>
        {jobs.map((job, index) => (
          <TinderCard
            ref={childRefs[index]}
            key={job._id}
            onSwipe={(dir) => swiped(dir, job, index)}
            preventSwipe={['up', 'down']}
            className='absolute w-full h-full'
          >
            <JobCard job={job} />
          </TinderCard>
        ))}

        {!canSwipe && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <p className='text-gray-400 text-lg'>No more jobs in this batch</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className='flex items-center gap-6 mt-8'>
        <button
          onClick={() => swipe('left')}
          disabled={!canSwipe}
          className='w-16 h-16 rounded-full bg-white border-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 flex items-center justify-center shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90'
        >
          <X className='size-8' />
        </button>

        <button
          onClick={() => swipe('right')}
          disabled={!canSwipe}
          className='w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 flex items-center justify-center shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90'
        >
          <Heart className='size-9' />
        </button>
      </div>

      {/* Hint text */}
      <p className='text-gray-400 text-xs mt-4'>
        Swipe right to apply, left to skip. Or use the buttons.
      </p>
    </div>
  )
}

// Need to import Briefcase for empty state
import { Briefcase } from 'lucide-react'

export default SwipeContainer
```

Note: Fix the import — `Briefcase` is already imported in `JobCard.jsx` but we need it here too. Actually, move the import to the top. The final file should have `Briefcase` in the initial import statement alongside `X, Heart, RotateCcw`:

```jsx
import { X, Heart, RotateCcw, Briefcase } from 'lucide-react'
```

And remove the duplicate import at the bottom.

**Step 2: Commit**

```bash
git add client/src/components/SwipeContainer.jsx
git commit -m "feat: add SwipeContainer with Tinder-style card stack"
```

---

## Task 9: Create ApplicationPreview Modal Component

**Files:**
- Create: `client/src/components/ApplicationPreview.jsx`

**Step 1: Create the application preview modal**

Create `client/src/components/ApplicationPreview.jsx`:

```jsx
import React, { useState, useRef } from 'react'
import { X, Send, Loader2, Mail, FileText, Edit3 } from 'lucide-react'
import ResumePreview from './ResumePreview'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import api from '../configs/api'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const ApplicationPreview = ({ isOpen, onClose, application, resume, job, onSent }) => {
  const { token } = useSelector(state => state.auth)
  const [emailSubject, setEmailSubject] = useState(application?.emailSubject || '')
  const [emailBody, setEmailBody] = useState(application?.emailBody || '')
  const [recipientEmail, setRecipientEmail] = useState(application?.recipientEmail || '')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('email')
  const resumeRef = useRef(null)

  if (!isOpen || !application) return null

  const generatePDF = async () => {
    const resumeElement = resumeRef.current?.querySelector('#resume-preview')
    if (!resumeElement) {
      throw new Error('Resume preview not found')
    }

    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

    // Convert to base64
    const pdfBase64 = pdf.output('datauristring').split(',')[1]
    return pdfBase64
  }

  const handleSave = async () => {
    try {
      await api.put(`/api/applications/${application._id}/edit`, {
        emailSubject,
        emailBody,
        recipientEmail,
      }, { headers: { Authorization: token } })
      toast.success('Changes saved')
    } catch (error) {
      toast.error('Failed to save changes')
    }
  }

  const handleSend = async () => {
    if (!recipientEmail) {
      toast.error('Please enter the recipient email address')
      return
    }

    setSending(true)
    try {
      // Save any edits first
      await api.put(`/api/applications/${application._id}/edit`, {
        emailSubject,
        emailBody,
        recipientEmail,
      }, { headers: { Authorization: token } })

      // Generate PDF from the resume preview
      const pdfBase64 = await generatePDF()

      // Send the email
      await api.post(`/api/email/send/${application._id}`, {
        pdfBase64,
      }, { headers: { Authorization: token } })

      toast.success('Application sent successfully!')
      onSent?.(application._id)
      onClose()
    } catch (error) {
      console.error('Error sending application:', error)
      toast.error(error.response?.data?.message || 'Failed to send application')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden flex flex-col shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>Review Application</h2>
            <p className='text-sm text-gray-500'>{job?.title} at {job?.company}</p>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg'>
            <X className='size-5' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-200'>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'email'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className='size-4' />
            Email
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'resume'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className='size-4' />
            Tailored Resume
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {activeTab === 'email' ? (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Recipient Email</label>
                <input
                  type='email'
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder='hr@company.com'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
                <input
                  type='text'
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Email Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none'
                />
              </div>
            </div>
          ) : (
            <div ref={resumeRef}>
              <ResumePreview
                data={resume}
                template={resume?.template || 'classic'}
                accentColor={resume?.accent_color || '#000000'}
                classes='py-4 bg-white'
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={handleSave}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2'
          >
            <Edit3 className='size-4' />
            Save Draft
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className='px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 disabled:opacity-50 shadow-lg'
          >
            {sending ? (
              <>
                <Loader2 className='size-4 animate-spin' />
                Sending...
              </>
            ) : (
              <>
                <Send className='size-4' />
                Send Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationPreview
```

**Step 2: Commit**

```bash
git add client/src/components/ApplicationPreview.jsx
git commit -m "feat: add ApplicationPreview modal with email editor and PDF generation"
```

---

## Task 10: Create Jobs Page (Swipe UI)

**Files:**
- Create: `client/src/pages/Jobs.jsx`

**Step 1: Create the Jobs page**

Create `client/src/pages/Jobs.jsx`:

```jsx
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setJobs, removeJob, setJobsLoading, setJobsError } from '../app/features/jobsSlice'
import { setCurrentApplication, clearCurrentApplication } from '../app/features/applicationsSlice'
import SwipeContainer from '../components/SwipeContainer'
import ApplicationPreview from '../components/ApplicationPreview'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle } from 'lucide-react'
import SEO from '../components/SEO'

const Jobs = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const { feed, loading, error } = useSelector(state => state.jobs)
  const { currentApplication } = useSelector(state => state.applications)

  const [previewData, setPreviewData] = useState(null)
  const [emailConnected, setEmailConnected] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(true)

  // Check email connection status
  const checkEmailStatus = async () => {
    try {
      const { data } = await api.get('/api/email/status', { headers: { Authorization: token } })
      setEmailConnected(data.connected)
    } catch {
      setEmailConnected(false)
    } finally {
      setCheckingEmail(false)
    }
  }

  // Fetch job feed
  const fetchJobs = async () => {
    dispatch(setJobsLoading(true))
    try {
      const { data } = await api.get('/api/jobs/feed', { headers: { Authorization: token } })
      dispatch(setJobs(data.jobs))
    } catch (error) {
      dispatch(setJobsError(error.response?.data?.message || 'Failed to fetch jobs'))
      toast.error(error.response?.data?.message || 'Failed to fetch jobs')
    }
  }

  useEffect(() => {
    checkEmailStatus()
    fetchJobs()
  }, [])

  const handleSwipeLeft = async (job) => {
    dispatch(removeJob(job._id))
    try {
      await api.post('/api/jobs/dismiss', { jobId: job._id }, { headers: { Authorization: token } })
    } catch {
      // Silent fail for dismiss
    }
  }

  const handleSwipeRight = async (job) => {
    dispatch(removeJob(job._id))

    if (!emailConnected) {
      toast.error('Please connect your email first in your profile settings')
      return
    }

    try {
      toast.loading('Generating tailored resume & email...', { id: 'preparing' })

      const { data } = await api.post('/api/applications/prepare', {
        jobId: job._id,
      }, { headers: { Authorization: token } })

      toast.dismiss('preparing')

      // Show preview modal
      setPreviewData({
        application: data.application,
        resume: data.resume,
        job: data.job,
      })
      dispatch(setCurrentApplication(data.application))
    } catch (error) {
      toast.dismiss('preparing')
      toast.error(error.response?.data?.message || 'Failed to prepare application')
    }
  }

  const handleApplicationSent = (applicationId) => {
    dispatch(clearCurrentApplication())
    setPreviewData(null)
    toast.success('Application sent!')
  }

  return (
    <>
      <SEO
        title="Job Swipe - Find & Apply to Jobs | Flower Resume"
        description="Swipe through personalized job suggestions and apply with AI-tailored resumes in one click."
      />

      <div className='max-w-7xl mx-auto px-4 py-6'>
        {/* Email connection warning */}
        {!checkingEmail && !emailConnected && (
          <div className='mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3'>
            <AlertCircle className='size-5 text-amber-500 shrink-0' />
            <div className='flex-1'>
              <p className='text-sm text-amber-800 font-medium'>Email not connected</p>
              <p className='text-xs text-amber-600 mt-0.5'>Connect your Gmail or Outlook to send applications directly.</p>
            </div>
            <Link
              to='/app/profile'
              className='px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2 shrink-0'
            >
              <Mail className='size-4' />
              Connect
            </Link>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-xl p-4'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}

        {/* Swipe area */}
        <div className='flex justify-center'>
          <SwipeContainer
            jobs={feed}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            loading={loading}
          />
        </div>
      </div>

      {/* Application preview modal */}
      {previewData && (
        <ApplicationPreview
          isOpen={!!previewData}
          onClose={() => {
            setPreviewData(null)
            dispatch(clearCurrentApplication())
          }}
          application={previewData.application}
          resume={previewData.resume}
          job={previewData.job}
          onSent={handleApplicationSent}
        />
      )}
    </>
  )
}

export default Jobs
```

**Step 2: Commit**

```bash
git add client/src/pages/Jobs.jsx
git commit -m "feat: add Jobs page with swipe UI and application flow"
```

---

## Task 11: Create AppliedTracker Page

**Files:**
- Create: `client/src/pages/Applied.jsx`

**Step 1: Create the Applied page**

Create `client/src/pages/Applied.jsx`:

```jsx
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setApplications, setApplicationsLoading } from '../app/features/applicationsSlice'
import api from '../configs/api'
import { CheckCircle, XCircle, Clock, ExternalLink, FileText } from 'lucide-react'
import SEO from '../components/SEO'

const Applied = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const { list, loading } = useSelector(state => state.applications)

  const fetchApplications = async () => {
    dispatch(setApplicationsLoading(true))
    try {
      const { data } = await api.get('/api/applications', { headers: { Authorization: token } })
      dispatch(setApplications(data.applications))
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full'>
            <CheckCircle className='size-3' /> Sent
          </span>
        )
      case 'failed':
        return (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-700 px-2.5 py-1 rounded-full'>
            <XCircle className='size-3' /> Failed
          </span>
        )
      default:
        return (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full'>
            <Clock className='size-3' /> Draft
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Applied Jobs Tracker | Flower Resume"
        description="Track all your job applications in one place."
      />

      <div className='max-w-5xl mx-auto px-4 py-6'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>Applied Jobs</h1>

        {list.length === 0 ? (
          <div className='text-center py-16'>
            <FileText className='size-16 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 text-lg'>No applications yet</p>
            <p className='text-gray-400 mt-1 text-sm'>Start swiping on jobs to apply!</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {list.map((app) => (
              <div
                key={app._id}
                className='bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow'
              >
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-900 truncate'>
                      {app.jobId?.title || 'Unknown Job'}
                    </h3>
                    <p className='text-sm text-gray-500 mt-0.5'>
                      {app.jobId?.company || 'Unknown Company'}
                      {app.jobId?.location && ` - ${app.jobId.location}`}
                    </p>
                    {app.recipientEmail && (
                      <p className='text-xs text-gray-400 mt-1'>To: {app.recipientEmail}</p>
                    )}
                  </div>

                  <div className='flex items-center gap-3 shrink-0'>
                    {getStatusBadge(app.status)}

                    <span className='text-xs text-gray-400'>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>

                    {app.jobId?.applyUrl && (
                      <a
                        href={app.jobId.applyUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600'
                        title='View original listing'
                      >
                        <ExternalLink className='size-4' />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Applied
```

**Step 2: Commit**

```bash
git add client/src/pages/Applied.jsx
git commit -m "feat: add Applied jobs tracker page"
```

---

## Task 12: Create EmailConnect Component

**Files:**
- Create: `client/src/components/EmailConnect.jsx`

**Step 1: Create the email connect component**

Create `client/src/components/EmailConnect.jsx`:

```jsx
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { Mail, CheckCircle, Unplug } from 'lucide-react'

const EmailConnect = () => {
  const { token } = useSelector(state => state.auth)
  const [status, setStatus] = useState({ connected: false, provider: 'none' })
  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/api/email/status', { headers: { Authorization: token } })
      setStatus(data)
    } catch {
      // Error checking status
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()

    // Check URL params for OAuth callback result
    const params = new URLSearchParams(window.location.search)
    if (params.get('emailConnected') === 'true') {
      toast.success('Email connected successfully!')
      checkStatus()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('emailError') === 'true') {
      toast.error('Failed to connect email. Please try again.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const connectGoogle = async () => {
    try {
      const { data } = await api.get('/api/email/auth/google', { headers: { Authorization: token } })
      window.location.href = data.authUrl
    } catch {
      toast.error('Failed to initiate Google sign-in')
    }
  }

  const connectOutlook = async () => {
    try {
      const { data } = await api.get('/api/email/auth/outlook', { headers: { Authorization: token } })
      window.location.href = data.authUrl
    } catch {
      toast.error('Failed to initiate Outlook sign-in')
    }
  }

  const disconnect = async () => {
    try {
      await api.delete('/api/email/disconnect', { headers: { Authorization: token } })
      setStatus({ connected: false, provider: 'none' })
      toast.success('Email disconnected')
    } catch {
      toast.error('Failed to disconnect email')
    }
  }

  if (loading) {
    return <div className='animate-pulse h-20 bg-gray-100 rounded-xl'></div>
  }

  return (
    <div className='bg-white border border-gray-200 rounded-xl p-5'>
      <h3 className='text-base font-semibold text-gray-900 mb-1 flex items-center gap-2'>
        <Mail className='size-5 text-blue-600' />
        Email Connection
      </h3>
      <p className='text-sm text-gray-500 mb-4'>Connect your email to send job applications directly.</p>

      {status.connected ? (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CheckCircle className='size-5 text-green-500' />
            <span className='text-sm font-medium text-gray-700'>
              Connected via {status.provider === 'gmail' ? 'Gmail' : 'Outlook'}
            </span>
          </div>
          <button
            onClick={disconnect}
            className='px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 flex items-center gap-1.5'
          >
            <Unplug className='size-3.5' />
            Disconnect
          </button>
        </div>
      ) : (
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={connectGoogle}
            className='flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium'
          >
            <svg className='size-5' viewBox='0 0 24 24'>
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'/>
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
            </svg>
            Connect Gmail
          </button>

          <button
            onClick={connectOutlook}
            className='flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium'
          >
            <svg className='size-5' viewBox='0 0 24 24'>
              <path fill='#0078D4' d='M24 7.387v10.478c0 .23-.08.424-.238.576-.16.154-.352.232-.578.232h-8.96v-6.12l1.602 1.18c.078.055.17.082.275.082.104 0 .196-.027.275-.082L24 7.387zm-9.776 5.166V6.52h8.552c.226 0 .42.078.578.232.158.152.238.346.238.576v.193l-7.09 5.03-2.278-1z'/>
              <path fill='#0078D4' d='M14.224 6.52v6.033l-2.278 1.598v-.002L0 7.522v-.193c0-.23.08-.424.238-.576.16-.154.352-.232.578-.232h13.408z'/>
              <path fill='#0078D4' d='M14.224 12.553v5.772H.816c-.226 0-.42-.078-.578-.232C.08 17.939 0 17.745 0 17.515V7.522l11.946 6.63 2.278-1.598z'/>
              <path fill='#0364B8' d='M8.862 5.834v12.063c0 .2-.058.384-.172.55-.114.167-.266.286-.454.358L1.04 21.766c-.164.067-.322.1-.474.1-.114 0-.224-.017-.328-.05C.08 21.743 0 21.538 0 21.264V5.48c0-.2.058-.384.172-.55.114-.167.266-.286.454-.358L7.636 1.68c.274-.116.53-.1.766.042.236.143.376.358.42.645.026.143.04.29.04.44v3.028z'/>
            </svg>
            Connect Outlook
          </button>
        </div>
      )}
    </div>
  )
}

export default EmailConnect
```

**Step 2: Commit**

```bash
git add client/src/components/EmailConnect.jsx
git commit -m "feat: add EmailConnect component for Gmail and Outlook OAuth"
```

---

## Task 13: Update App Routes & Navigation

**Files:**
- Modify: `client/src/App.jsx`
- Modify: `client/src/components/Navbar.jsx`
- Modify: `client/src/pages/UserProfile.jsx` (add EmailConnect)

**Step 1: Add routes to App.jsx**

Add imports for the new pages:

```jsx
import Jobs from './pages/Jobs'
import Applied from './pages/Applied'
```

Add inside the `<Route path='app' ...>` block, after the existing routes:

```jsx
<Route path='jobs' element={<Jobs />}/>
<Route path='applied' element={<Applied />}/>
```

**Step 2: Add navigation links to Navbar.jsx**

Add import:

```jsx
import { UserCircleIcon, FileTextIcon, ShieldIcon, BriefcaseIcon, HeartIcon } from 'lucide-react'
```

Add two new Link elements before the "Your Resume Data" link in the nav:

```jsx
<Link to='/app/jobs' className='flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-300 hover:border-green-400 px-4 py-1.5 rounded-full active:scale-95 transition-all shadow-sm hover:shadow group'>
  <BriefcaseIcon className='size-4 text-green-600 group-hover:scale-110 transition-transform duration-300' />
  <span className='max-sm:hidden font-medium text-slate-700'>Job Swipe</span>
</Link>
<Link to='/app/applied' className='flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-300 hover:border-purple-400 px-4 py-1.5 rounded-full active:scale-95 transition-all shadow-sm hover:shadow group'>
  <HeartIcon className='size-4 text-purple-600 group-hover:scale-110 transition-transform duration-300' />
  <span className='max-sm:hidden font-medium text-slate-700'>Applied</span>
</Link>
```

**Step 3: Add EmailConnect to UserProfile page**

Read `client/src/pages/UserProfile.jsx` first, then add the `EmailConnect` component import and place it in the page (likely at the top or bottom of the profile form area):

```jsx
import EmailConnect from '../components/EmailConnect'
```

Add the component inside the profile page JSX, after the existing content sections:

```jsx
<EmailConnect />
```

**Step 4: Commit**

```bash
git add client/src/App.jsx client/src/components/Navbar.jsx client/src/pages/UserProfile.jsx
git commit -m "feat: add job swipe routes, navigation links, and email connect to profile"
```

---

## Task 14: Update server.js with all new routes (final wiring)

**Files:**
- Modify: `server/server.js`

**Step 1: Verify server.js has all route imports**

The final `server/server.js` should look like:

```js
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import applicationRouter from "./routes/applicationRoutes.js";
import emailRouter from "./routes/emailRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

await connectDB()

app.use(express.json({ limit: '50mb' }))
app.use(cors())

app.get('/', (req, res)=> res.send("Server is live..."))
app.use('/api/users', userRouter)
app.use('/api/resumes', resumeRouter)
app.use('/api/ai', aiRouter)
app.use('/api/admin', adminRouter)
app.use('/api/jobs', jobRouter)
app.use('/api/applications', applicationRouter)
app.use('/api/email', emailRouter)

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});
```

Note: Increased JSON body limit to `50mb` to handle base64 PDF uploads.

**Step 2: Commit**

```bash
git add server/server.js
git commit -m "feat: wire up all job swipe routes and increase body size limit for PDF uploads"
```

---

## Task 15: Add Environment Variables & Test End-to-End

**Files:**
- Modify: `server/.env` (or `.env` in project root, wherever it exists)

**Step 1: Add required environment variables**

Add to your `.env` file:

```
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=jsearch.p.rapidapi.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/email/auth/google/callback
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/email/auth/outlook/callback
CLIENT_URL=http://localhost:5173
```

**Step 2: Manual end-to-end test checklist**

1. Start server: `cd server && npm run server`
2. Start client: `cd client && npm run dev`
3. Log in as existing user
4. Navigate to `/app/profile` — verify EmailConnect component renders
5. Navigate to `/app/jobs` — verify job cards load from JSearch API
6. Swipe left on a card — verify it disappears and the job is dismissed
7. Swipe right on a card — verify ApplicationPreview modal opens with AI-generated content
8. Edit the email body and recipient in the modal
9. Check the "Tailored Resume" tab — verify it renders a resume
10. Navigate to `/app/applied` — verify the application appears in the list
11. Connect email via OAuth (test with Gmail first)
12. Swipe right again and send an application — verify email is received

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete job swipe feature - Tinder-style job applications with AI-tailored resumes"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Install dependencies | package.json (both) |
| 2 | Server models | Job.js, Application.js, User.js |
| 3 | Job controller & routes | jobController.js, jobRoutes.js |
| 4 | Application controller & routes | applicationController.js, applicationRoutes.js |
| 5 | Email OAuth controller & routes | emailController.js, emailRoutes.js |
| 6 | Redux slices | jobsSlice.js, applicationsSlice.js, store.js |
| 7 | JobCard component | JobCard.jsx |
| 8 | SwipeContainer component | SwipeContainer.jsx |
| 9 | ApplicationPreview modal | ApplicationPreview.jsx |
| 10 | Jobs page (swipe UI) | Jobs.jsx |
| 11 | Applied tracker page | Applied.jsx |
| 12 | EmailConnect component | EmailConnect.jsx |
| 13 | Update routes & navigation | App.jsx, Navbar.jsx, UserProfile.jsx |
| 14 | Final server wiring | server.js |
| 15 | Environment variables & E2E test | .env |
