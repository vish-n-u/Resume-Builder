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