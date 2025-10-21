import Resume from "../models/Resume.js";
import DetailedResume from "../models/DetailedResume.js";
import ai from "../configs/ai.js";

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if(!userContent){
            return res.status(400).json({message: 'Missing required fields'})
        }

       const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else." },
                {
                    role: "user",
                    content: userContent,
                },
    ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for enhancing a resume's job description
// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;

        if(!userContent){
            return res.status(400).json({message: 'Missing required fields'})
        }

       const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system",
                 content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else." },
                {
                    role: "user",
                    content: userContent,
                },
    ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for uploading resume and saving to default resume data (for onboarding)
// POST: /api/ai/upload-resume-to-profile
export const uploadResumeToProfile = async (req, res) => {
    try {
        const {resumeText} = req.body;
        const userId = req.userId;

        if(!resumeText){
            return res.status(400).json({message: 'Missing required fields'})
        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume."

        const userPrompt = `extract data from this resume: ${resumeText}

        Provide data in the following JSON format with no additional text before or after:

        {
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
        }
        Instructions:-
        1) Provide the data in json structure, but dont add the type field, that is there to provide u the context in which the response for each field is expected.
        2) Extract as much information as possible including certifications and achievements if present.
        `;

       const response = await ai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system",
                 content: systemPrompt },
                {
                    role: "user",
                    content: userPrompt,
                },
        ],
        response_format: {type:  'json_object'}
        })

        const extractedData = response.choices[0].message.content;
        console.log("extractedData==>",extractedData)

        const parsedData = JSON.parse(extractedData)
        console.log("data parsed")

        // Save to DetailedResume (default resume data) instead of creating a resume
        const detailedResume = await DetailedResume.findOneAndUpdate(
            { userId },
            {
                userId,
                professional_summary: parsedData.professional_summary || '',
                skills: parsedData.skills || [],
                personal_info: parsedData.personal_info || {},
                experience: parsedData.experience || [],
                project: parsedData.project || [],
                education: parsedData.education || [],
                certifications: parsedData.certifications || [],
                achievements: parsedData.achievements || [],
                custom_sections: []
            },
            { new: true, upsert: true }
        )
        console.log("default resume data saved")

        res.json({message: 'Resume data saved to profile successfully'})
    } catch (error) {
        console.error("error uploading resume to profile:", error)
        return res.status(400).json({message: error.message})
    }
}

// controller for uploading a resume to the database
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
    try {
        const {resumeText, title} = req.body;
        const userId = req.userId;


        if(!resumeText){
            return res.status(400).json({message: 'Missing required fields'})
        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume."

        const userPrompt = `extract data from this resume: ${resumeText}
        
        Provide data in the following JSON format with no additional text before or after:

        {
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
        }
        Instructions:- 
        1) Provide the data in json structure, but dont add the type field, that is there to provide u the context in which the response for each field is expected.
        `;

       const response = await ai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system",
                 content: systemPrompt },
                {
                    role: "user",
                    content: userPrompt,
                },
        ],
        response_format: {type:  'json_object'}
        })


        const extractedData = response.choices[0].message.content;
        console.log("extractedData==>",extractedData)

        const parsedData = JSON.parse(extractedData)
        console.log("data parsed")
        let newResume
        try{
         newResume = await Resume.create({userId, title, ...parsedData})
        }
        catch(e){
            // console.log("e==>",e)
            throw new Error(e)
        }
        console.log("resume created")

        res.json({resumeId: newResume._id})
    } catch (error) {
        // console.log("error==>",error)
        return res.status(400).json({message: error.message})
    }
}

// controller for providing AI suggestions based on job description
// POST: /api/ai/suggest-job-desc
export const suggestJobDescription = async (req, res) => {
    try {
        const { currentDescription, jobDescription, position, company } = req.body;
        const userId = req.userId;

        if (!jobDescription) {
            return res.status(400).json({ message: 'Job description is required' });
        }

        // Get user's detailed resume data for context
        const detailedResume = await DetailedResume.findOne({ userId });

        if (!detailedResume) {
            return res.status(404).json({
                message: 'No default resume data found. Please complete your profile first.'
            });
        }

        // Prepare context from user's profile
        const userContext = {
            skills: detailedResume.skills,
            professional_summary: detailedResume.professional_summary,
            all_experience: detailedResume.experience.map(exp => ({
                company: exp.company,
                position: exp.position,
                description: exp.description
            }))
        };

        const systemPrompt = `You are an expert resume writer and career coach. Your task is to provide 5 specific, actionable suggestions for job description bullet points that align with the given job description.

CRITICAL RULES:
1. Analyze the job description to understand what skills and responsibilities are valued
2. Use the user's background and skills as context to make realistic suggestions
3. Each suggestion should be a complete, professional bullet point ready to use
4. Suggestions should highlight achievements, use action verbs, and include quantifiable results when possible
5. Make suggestions ATS-friendly and keyword-optimized for the job description
6. Suggestions don't need to match the current description exactly - be creative and smart about what would fit the role
7. Each suggestion should be 1-2 sentences maximum
8. Focus on impact and results, not just responsibilities

Return ONLY a JSON array of 5 suggestion strings, no additional text.`;

        const userPrompt = `JOB DESCRIPTION:
${jobDescription}

CURRENT POSITION CONTEXT:
Position: ${position || 'Not specified'}
Company: ${company || 'Not specified'}
Current Description: ${currentDescription || 'Not provided'}

USER'S BACKGROUND (for context):
Skills: ${userContext.skills.join(', ')}
Professional Summary: ${userContext.professional_summary}

INSTRUCTIONS:
Based on the job description and the user's background, provide 5 specific bullet point suggestions that would make this experience stand out for the target role. The suggestions should:
1. Align with keywords and requirements from the job description
2. Be realistic given the user's skills and background
3. Use strong action verbs and quantifiable achievements
4. Be ready to add directly to the resume
5. Not necessarily match the current description - think creatively about relevant achievements

Return in this exact JSON format:
{
  "suggestions": [
    "First complete bullet point suggestion",
    "Second complete bullet point suggestion",
    "Third complete bullet point suggestion",
    "Fourth complete bullet point suggestion",
    "Fifth complete bullet point suggestion"
  ]
}`;

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8
        });

        const suggestionData = JSON.parse(response.choices[0].message.content);
        console.log("AI suggestions generated:", suggestionData);

        return res.status(200).json({
            suggestions: suggestionData.suggestions || []
        });

    } catch (error) {
        console.error("Error generating suggestions:", error);
        return res.status(400).json({ message: error.message });
    }
}

// controller for creating a tailored resume based on job description
// POST: /api/ai/tailor-resume
export const tailorResume = async (req, res) => {
    try {
        const { jobDescription, title } = req.body;
        const userId = req.userId;

        if (!jobDescription || !title) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get user's detailed resume data
        const detailedResume = await DetailedResume.findOne({ userId });

        if (!detailedResume) {
            return res.status(404).json({
                message: 'No default resume data found. Please complete your profile first.'
            });
        }

        console.log("Tailoring resume for user:", userId);

        // Prepare user's complete profile data for AI
        const userProfileData = {
            personal_info: detailedResume.personal_info,
            professional_summary: detailedResume.professional_summary,
            skills: detailedResume.skills,
            experience: detailedResume.experience,
            education: detailedResume.education,
            project: detailedResume.project
        };

        const systemPrompt = `You are an expert resume tailoring AI. Your task is to analyze a job description and the user's complete profile data, then create a perfectly tailored resume that highlights the most relevant experience, skills, and achievements for that specific role.

CRITICAL RULES
1. ONLY use data that exists in the user's profile - DO NOT invent, add, or fabricate ANY information
2. NEVER modify job titles, company names, dates
3. NEVER add projects that don't exist in the user's project array
4. NEVER change education details (institution, degree, field, dates, GPA)
5. Use HTML Formatting (use stuff like <bold> , <italics> , <ol>, <u>, <a href> ) to format and highlight key points of the resume, dont overdo it.

WHAT YOU CAN DO:
1. SELECT the most relevant items from the user's existing data
2. REORDER experience/projects to show most relevant first
3. Based on the user experience and projects you can take the liberty to add skills based on Job Desription
4. REWRITE the professional summary using the user's actual background to target this specific role
5. EMPHASIZE relevant parts of existing descriptions without changing facts
6. You have the liberty to change experience a bit if it naturally fits with the Users's experience and projects to match the JD.
7. Use HTML Formatting (use stuff like <bold> , <italics> , <ol>, <u>, <a href> ) to format and highlight key points of the resume, dont overdo it.

SELECTION CRITERIA:
- Analyze the job description to understand required skills and responsibilities
- From the user's profile, select items that best match the job requirements
- Prioritize experience and projects that demonstrate relevant capabilities

Return ONLY valid JSON with no additional text.`;

        const userPrompt = `JOB DESCRIPTION:
${jobDescription}

USER'S COMPLETE PROFILE DATA :
${JSON.stringify(userProfileData, null, 2)}

INSTRUCTIONS:
Create a tailored resume using  the data provided above. Select and reorder the most relevant items.

CRITICAL:
- DO NOT modify company names, job titles, or dates in experience
- DO NOT add projects not in the user's project array
- DO NOT invent any achievements 
- DO NOT change education details
- Use HTML Formatting (use stuff like <bold> , <italics> , <ol>, <u>, <a href> ) to format and highlight key points of the resume, dont overdo it.


Return in this exact JSON format:
{
  "professional_summary": "Write a 2-3 sentence summary using ONLY the user's  background and experience from the profile data above, tailored to highlight relevance to this job",
  "skills": [],
  "personal_info": {
    "image": "${detailedResume.personal_info.image || ''}",
    "full_name": "${detailedResume.personal_info.full_name || ''}",
    "profession": "${detailedResume.personal_info.profession || ''}",
    "email": "${detailedResume.personal_info.email || ''}",
    "phone": "${detailedResume.personal_info.phone || ''}",
    "location": "${detailedResume.personal_info.location || ''}",
    "linkedin": "${detailedResume.personal_info.linkedin || ''}",
    "website": "${detailedResume.personal_info.website || ''}"
  },
  "experience": [
    {
      "company": "EXACT company name from user's data",
      "position": "EXACT position from user's data",
      "start_date": "EXACT start_date from user's data",
      "end_date": "EXACT end_date from user's data",
      "description": "Can modify slightly based on above rules.",
      "is_current": "EXACT is_current value from user's data"
    }
    // Include most relevant experiences, reordered by relevance to the job
  ],
  "project": [
    {
      "name": "EXACT name from user's data",
      "type": "EXACT type from user's data",
      "description": ""
    }
    // Include most relevant projects, reordered by relevance
  ],
  "education": [
    {
      "institution": "EXACT institution from user's data",
      "degree": "EXACT degree from user's data",
      "field": "EXACT field from user's data",
      "graduation_date": "EXACT graduation_date from user's data",
      "gpa": "EXACT gpa from user's data"
    }
    // Include all education entries with EXACT data
  ]
}`;

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        const tailoredData = JSON.parse(response.choices[0].message.content);
        console.log("AI tailored resume data:", tailoredData);

        // Create new resume with tailored data
        const newResume = await Resume.create({
            userId,
            title,
            job_description: jobDescription,
            professional_summary: tailoredData.professional_summary,
            skills: tailoredData.skills,
            personal_info: tailoredData.personal_info,
            experience: tailoredData.experience,
            project: tailoredData.project,
            education: tailoredData.education
        });

        console.log("Tailored resume created successfully:", newResume._id);

        return res.status(201).json({
            message: 'Tailored resume created successfully',
            resumeId: newResume._id
        });

    } catch (error) {
        console.error("Error tailoring resume:", error);
        return res.status(400).json({ message: error.message });
    }
}