import User from "../models/User.js";
import Resume from "../models/Resume.js";
import DetailedResume from "../models/DetailedResume.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email createdAt").lean();

    const userIds = users.map((u) => u._id);
    const resumeCounts = await Resume.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    for (const r of resumeCounts) {
      countMap[r._id.toString()] = r.count;
    }

    const result = users.map((u) => ({
      ...u,
      resumeCount: countMap[u._id.toString()] || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserResumes = async (req, res) => {
  try {
    const { userId } = req.params;
    const resumes = await Resume.find(
      { userId },
      "title template createdAt updatedAt downloadCount lastDownloadedAt"
    ).sort({ updatedAt: -1 });

    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json({ resume });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await DetailedResume.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin-only: record downloads that happened before server-side tracking existed
// (copied from PostHog). Never lowers an existing count.
// POST /api/admin/resumes/:resumeId/backfill-downloads  { count, lastDownloadedAt }
export const backfillResumeDownloads = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const count = Math.max(0, parseInt(req.body?.count, 10) || 0);
    const last = req.body?.lastDownloadedAt ? new Date(req.body.lastDownloadedAt) : null;
    if (!count || !last || isNaN(last)) {
      return res.status(400).json({ message: "count and lastDownloadedAt are required" });
    }
    const resume = await Resume.findById(resumeId, "downloadCount lastDownloadedAt");
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    await Resume.updateOne(
      { _id: resumeId },
      { $set: {
          downloadCount: Math.max(resume.downloadCount || 0, count),
          lastDownloadedAt: resume.lastDownloadedAt && resume.lastDownloadedAt > last ? resume.lastDownloadedAt : last,
      } },
      { timestamps: false }
    );
    res.json({ message: "Backfilled" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
