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
