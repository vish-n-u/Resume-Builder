import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    title: {type: String, default: 'Untitled Resume'},
    job_description: {type: String, default: ''},
    public: { type: Boolean, default: false },
    template: { type: String, default: "classic" },
    accent_color: { type: String, default: "#000000" },
    professional_summary: { type: String, default: '' },
    skills: [{ type: String }],
    personal_info: {
        image: {type: String, default: '' },
        full_name: {type: String, default: '' },
        profession: {type: String, default: '' },
        email: {type: String, default: '' },
        phone: {type: String, default: '' },
        location: {type: String, default: '' },
        linkedin: {type: String, default: '' },
        website: {type: String, default: '' },
    },
    experience: [
        {
            company: { type: String },
            position: { type: String },
            start_date: { type: String },
            end_date: { type: String },
            description: { type: String },
            is_current: { type: Boolean },
        }
    ],
    project: [
        {
            name: { type: String },
            type: { type: String },
            description: { type: String },
        }
    ],
    education: [
        {
            institution: { type: String },
            degree: { type: String },
            field: { type: String },
            graduation_date: { type: String },
            gpa: { type: String },
        }
    ],
    certifications: [
        {
            name: { type: String },
            issuer: { type: String },
            date: { type: String },
            credential_id: { type: String },
        }
    ],
    achievements: [
        {
            title: { type: String },
            description: { type: String },
        }
    ],
    custom_sections: [
        {
            section_name: { type: String },
            content: { type: String },
        }
    ],
    sectionVisibility: {
        summary: { type: Boolean, default: true },
        experience: { type: Boolean, default: true },
        education: { type: Boolean, default: true },
        projects: { type: Boolean, default: true },
        skills: { type: Boolean, default: true },
        certifications: { type: Boolean, default: true },
        achievements: { type: Boolean, default: true },
        customSections: { type: Boolean, default: true },
    },
    // Order of the reorderable sections (ids as in sectionVisibility); empty = template's default order
    section_order: [{ type: String }],
    // Keywords extracted from job_description by AI, used for the job match score
    jd_analysis: {
        keywords: [
            {
                _id: false,
                term: { type: String },
                importance: { type: String, enum: ['required', 'preferred'], default: 'required' },
                aliases: [{ type: String }],
            }
        ],
        jd_hash: { type: String }, // hash of the job_description the keywords were extracted from
        analyzed_at: { type: Date },
    }
}, {timestamps: true, minimize: false})

const Resume = mongoose.model('Resume', ResumeSchema)

export default Resume