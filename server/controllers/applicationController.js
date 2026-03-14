import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import DetailedResume from "../models/DetailedResume.js";
import ai from "../configs/ai.js";
import { tailorResumeCore } from "./aiController.js";

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

        const detailedResume = await DetailedResume.findOne({ userId });
        if (!detailedResume) {
            return res.status(400).json({ message: "Please fill in your resume data first." });
        }

        // Use the same tailorResume logic from aiController to create the resume
        const tailoredResume = await tailorResumeCore({
            userId,
            jobDescription: job.description,
            title: `${job.title} at ${job.company}`,
            detailedResume,
        });

        // Generate application email separately
        const userPreferences = detailedResume.preferences || {};
        const emailPrompt = `You are an expert career coach. Write a concise application email (under 200 words) introducing the candidate for the role.

USER PREFERENCES:
- Writing Style: ${userPreferences.writing_style || 'professional'}
- Tone: ${userPreferences.tone || 'confident'}
${userPreferences.custom_requirements ? `\nCUSTOM REQUIREMENTS: ${userPreferences.custom_requirements}\n` : ''}

Respond in this exact JSON format:
{
    "email_subject": "Application for [Job Title] at [Company]",
    "email_body": "The application email body"
}

Only return valid JSON. No markdown, no code blocks.`;

        const emailResponse = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: emailPrompt },
                {
                    role: "user",
                    content: `Candidate: ${detailedResume.personal_info?.full_name || ''}, ${detailedResume.personal_info?.profession || ''}
Skills: ${(detailedResume.skills || []).join(', ')}
Job: ${job.title} at ${job.company}
Description: ${job.description}`
                },
            ],
            response_format: { type: 'json_object' },
        });

        let emailResult;
        try {
            emailResult = JSON.parse(emailResponse.choices[0].message.content);
        } catch {
            emailResult = {
                email_subject: `Application for ${job.title} at ${job.company}`,
                email_body: '',
            };
        }

        const application = await Application.create({
            userId,
            jobId: job._id,
            resumeId: tailoredResume._id,
            emailSubject: emailResult.email_subject,
            emailBody: emailResult.email_body,
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

// POST /api/applications/:id/apply-external - Mark application as applied externally
export const applyExternally = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const application = await Application.findOne({ _id: id, userId });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        application.status = 'applied_externally';
        application.sentAt = new Date();
        await application.save();

        res.json({ application });
    } catch (error) {
        console.error("Error marking external application:", error);
        res.status(500).json({ message: "Failed to mark application" });
    }
};
