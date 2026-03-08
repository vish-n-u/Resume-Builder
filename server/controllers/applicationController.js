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

        const detailedResume = await DetailedResume.findOne({ userId });
        if (!detailedResume) {
            return res.status(400).json({ message: "Please fill in your resume data first." });
        }

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
