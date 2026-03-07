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
