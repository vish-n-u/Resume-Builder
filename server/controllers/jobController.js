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
        let locationMumbai = "Mumbai"
        console.log(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery + (location ? ' in ' + locationMumbai : ''))}&page=${page}&num_pages=1`)

        const response = await fetch(
            `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery + (location ? ' in ' + locationMumbai : ''))}&page=${page}&num_pages=1`,
            {
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                    'x-rapidapi-host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com',
                },
            }
        );

        const apiData = await response.json();

        console.log("`JSearch API response:", apiData);

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
                applyEmail: '',
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
