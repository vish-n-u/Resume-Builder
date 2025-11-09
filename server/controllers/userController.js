import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Resume from "../models/Resume.js";
import DetailedResume from "../models/DetailedResume.js";


const generateToken = (userId)=>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '7d'})
    return token;
}

// controller for user registration
// POST: /api/users/register
export const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        // check if required fields are present
        if(!name || !email || !password){
            return res.status(400).json({message: 'Missing required fields'})
        }

        // check if user already exists
        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message: 'User already exists'})
        }

        // create new user
         const hashedPassword = await bcrypt.hash(password, 10)
         const newUser = await User.create({
            name, email, password: hashedPassword
         })

         // return success message
         const token = generateToken(newUser._id)
         newUser.password = undefined;

         return res.status(201).json({message: 'User created successfully', token, user: newUser})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for user login
// POST: /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password} = req.body;

        // check if user exists
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: 'Invalid email or password'})
        }
        console.log("user==>",user)

        // check if password is correct
        if(!user.comparePassword(password)){
            return res.status(400).json({message: 'Invalid email or password'})
        }

        // return success message
         const token = generateToken(user._id)
         user.password = undefined;

         return res.status(200).json({message: 'Login successful', token, user})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for getting user by id
// GET: /api/users/data
export const getUserById = async (req, res) => {
    try {
        
        const userId = req.userId;

        // check if user exists
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        // return user
        user.password = undefined;
         return res.status(200).json({user})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for getting user resumes
// GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;

        console.log("userId==>",userId)

        // return user resumes (from Resume collection, not DetailedResume)
        const resumes = await Resume.find({userId}).sort({ updatedAt: -1 })
        console.log("resumes==>",resumes)
        return res.status(200).json({resumes})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for updating user profile
// PUT: /api/users/update
export const updateUser = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email } = req.body;

        // check if required fields are present
        if(!name || !email){
            return res.status(400).json({message: 'Missing required fields'})
        }

        // check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } })
        if(existingUser){
            return res.status(400).json({message: 'Email already taken'})
        }

        // update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true }
        )

        if(!updatedUser){
            return res.status(404).json({message: 'User not found'})
        }

        updatedUser.password = undefined;
        return res.status(200).json({message: 'Profile updated successfully', user: updatedUser})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for changing user password
// PUT: /api/users/change-password
export const changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;

        // check if required fields are present
        if(!currentPassword || !newPassword){
            return res.status(400).json({message: 'Missing required fields'})
        }

        // check password length
        if(newPassword.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters'})
        }

        // find user
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }

        // verify current password
        if(!user.comparePassword(currentPassword)){
            return res.status(400).json({message: 'Current password is incorrect'})
        }

        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // update password
        user.password = hashedPassword
        await user.save()

        return res.status(200).json({message: 'Password changed successfully'})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for getting user's default resume data
// GET: /api/users/default-resume-data
export const getDefaultResumeData = async (req, res) => {
    try {
        const userId = req.userId;

        // Find detailed resume for this user from DetailedResume collection
        const detailedResume = await DetailedResume.findOne({ userId })

        if(!detailedResume){
            return res.status(200).json({defaultResumeData: {}})
        }

        // Remove MongoDB-specific fields
        const resumeData = detailedResume.toObject()
        delete resumeData._id
        delete resumeData.userId
        delete resumeData.__v
        delete resumeData.createdAt
        delete resumeData.updatedAt

        console.log("Fetched detailed resume data:", resumeData)

        return res.status(200).json({defaultResumeData: resumeData})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for updating user's default resume data
// PUT: /api/users/update-default-resume-data
export const updateDefaultResumeData = async (req, res) => {
    try {
        const userId = req.userId;
        const { defaultResumeData } = req.body;

        if(!defaultResumeData){
            return res.status(400).json({message: 'Missing required fields'})
        }

        let parsedData = typeof defaultResumeData === 'string'
            ? JSON.parse(defaultResumeData)
            : defaultResumeData;

        // Handle image upload if present
        if(req.file){
            const imageKit = (await import('../configs/imageKit.js')).default;
            const imageBuffer = req.file.buffer;

            const uploadResult = await imageKit.upload({
                file: imageBuffer,
                fileName: req.file.originalname,
                transformation: req.body.removeBackground === 'yes'
                    ? [{ pre: 'l-image,i-remove_bg_shadow,bg-FFFFFF' }]
                    : undefined
            });

            parsedData.personal_info.image = uploadResult.url;
        }

        // Save or update in DetailedResume collection (separate from User)
        // Use findOneAndUpdate with upsert to create if doesn't exist
        const detailedResume = await DetailedResume.findOneAndUpdate(
            { userId },
            {
                userId,
                professional_summary: parsedData.professional_summary,
                skills: parsedData.skills,
                personal_info: parsedData.personal_info,
                experience: parsedData.experience,
                project: parsedData.project,
                education: parsedData.education,
                certifications: parsedData.certifications,
                achievements: parsedData.achievements,
                custom_sections: parsedData.custom_sections,
                preferences: parsedData.preferences
            },
            { new: true, upsert: true }
        )

        if(!detailedResume){
            return res.status(500).json({message: 'Failed to save detailed resume'})
        }

        console.log("Saved detailed resume:", detailedResume)

        // Return the data without MongoDB fields
        const returnData = detailedResume.toObject()
        delete returnData._id
        delete returnData.userId
        delete returnData.__v
        delete returnData.createdAt
        delete returnData.updatedAt

        return res.status(200).json({
            message: 'Default resume data updated successfully',
            defaultResumeData: returnData
        })

    } catch (error) {
        console.error("Error updating detailed resume:", error)
        return res.status(400).json({message: error.message})
    }
}