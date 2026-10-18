import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import DetailedResume from "../models/DetailedResume.js";
import fs from 'fs';

const EDITABLE_RESUME_FIELDS = [
    'title', 'job_description', 'public', 'template', 'accent_color',
    'professional_summary', 'skills', 'personal_info', 'experience', 'project',
    'education', 'certifications', 'achievements', 'custom_sections', 'sectionVisibility', 'section_order'
]


// controller for creating a new resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const {title} = req.body;

        // Get user's default resume data from DetailedResume collection
        const detailedResume = await DetailedResume.findOne({ userId });
        const defaultData = detailedResume || {};

        // Create new resume with default data pre-filled
        const newResume = await Resume.create({
            userId,
            title,
            // Merge default data with resume structure
            professional_summary: defaultData.professional_summary || '',
            skills: defaultData.skills || [],
            personal_info: defaultData.personal_info || {},
            experience: defaultData.experience || [],
            project: defaultData.project || [],
            education: defaultData.education || [],
            certifications: defaultData.certifications || [],
            achievements: defaultData.achievements || [],
            custom_sections: defaultData.custom_sections || [],
            preferences: defaultData.preferences || {}
        })

        // return success message
        return res.status(201).json({message: 'Resume created successfully', resume: newResume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for deleting a resume
// DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

       await Resume.findOneAndDelete({userId, _id: resumeId})

        // return success message
        return res.status(200).json({message: 'Resume deleted successfully'})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

       const resume = await Resume.findOne({userId, _id: resumeId})

       if(!resume){
        return res.status(404).json({message: "Resume not found"})
       }

        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;

        return res.status(200).json({resume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// get resume by id public
// GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({public: true, _id: resumeId})

        if(!resume){
        return res.status(404).json({message: "Resume not found"})
       }

       return res.status(200).json({resume})
    } catch (error) {
         return res.status(400).json({message: error.message})
    }
}

// controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) =>{
    try {
        const userId = req.userId;
        const {resumeId, resumeData, removeBackground} = req.body
        const image = req.file;
        
        const parsedData = typeof resumeData === 'string' ? JSON.parse(resumeData) : (resumeData || {})

        // Only allow editable fields; never let the client change ownership or ids
        const resumeDataCopy = {}
        for (const field of EDITABLE_RESUME_FIELDS) {
            if (parsedData[field] !== undefined) resumeDataCopy[field] = parsedData[field]
        }

        if(image){
            try {
                const imageBufferData = fs.createReadStream(image.path)

                const response = await imagekit.files.upload({
                                file: imageBufferData,
                                fileName: 'resume.png',
                                folder: 'user-resumes',
                                 transformation: {
                                    pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
                                 }
                                });

                resumeDataCopy.personal_info = { ...(resumeDataCopy.personal_info || {}), image: response.url }
            } finally {
                fs.promises.unlink(image.path).catch(() => {})
            }
        }

       // Use findOneAndUpdate to ensure we're updating the correct user's resume
       const resume = await Resume.findOneAndUpdate(
           { _id: resumeId, userId: userId },
           resumeDataCopy,
           { new: true }
       )

       if (!resume) {
           return res.status(404).json({ message: 'Resume not found' })
       }

       return res.status(200).json({message: 'Saved successfully', resume})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}