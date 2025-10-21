import mongoose from "mongoose";

const DetailedResumeSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true},
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
}, {timestamps: true, minimize: false})

const DetailedResume = mongoose.model('DetailedResume', DetailedResumeSchema)

export default DetailedResume
