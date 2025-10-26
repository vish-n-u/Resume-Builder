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

        const systemPrompt = `
You are an expert resume tailoring AI that customizes resumes strictly based on verified user data.

PRIMARY OBJECTIVE:
Create a resume tailored to a job description — only by reorganizing, rewording, and emphasizing data that already exists in the user's profile.

CRITICAL RULES:
1. DO NOT fabricate, assume, or infer information that isn't explicitly present in the user's profile.
2. DO NOT modify company names, job titles, dates, education details, or add new projects.
3. DO NOT create achievements, metrics, or results that are not already in the profile.
4. Only rephrase or highlight details that genuinely exist in the user data.
5. If something is missing (e.g. a required JD skill is not in user data), simply omit it — do not try to fill that gap.
6. Use minimal HTML formatting (<b>, <i>, <u>, <ol>, <li>, <a href>) to enhance readability. Do not overuse formatting.
7. NEVER generate content that would make the resume factually inaccurate.
8. PRESERVE ALL LINKS: Do not remove or modify any HTML links (<a href>) in project descriptions, including demo links, live site links, GitHub links, or any other URLs.
9. Always Add All of the experience

MINIMUM CONTENT REQUIREMENT:
- The tailored resume MUST contain at least 350 words across all sections (professional summary, experience descriptions, and project descriptions).
- PROJECTS: Include 3 most relevant projects.
- To meet the 350-word requirement: First expand and add more detail to the Experience section descriptions if the user has work experience.
- ONLY if the user has NO experience, then you may add more than 3 projects to meet the word count.
- Prioritize JD-matching content first, but ensure the word count is met through Experience expansion when possible.

ALLOWED FLEXIBILITY:
- You may reorder experience or projects for better relevance.
- You may slightly rephrase text for clarity or alignment with the JD (only if true to the user's background).
- You may include *closely related skills* if they are implied by the user's actual tools or technologies (e.g., user lists "fetch API" → "Axios" is acceptable; "Drupal" is not).
- You may mention soft skills (communication, teamwork, etc.) only if they naturally fit with the user's history.
- You may expand existing descriptions with more detail while remaining factual.

FORMATTING FOR READABILITY:
- Format key skills and technologies in BOLD (<b>tag</b>) for emphasis and easy scanning.
- Use bullet points (<ul><li>) or numbered lists (<ol><li>) in experience and project descriptions when listing multiple accomplishments or tasks.
- Highlight important metrics, percentages, or achievements in BOLD.
- Structure descriptions with clear, scannable formatting to make key information stand out.
- Example: "Developed a <b>React</b> application that increased user engagement by <b>40%</b>"

BEHAVIOR GUIDELINES:
- When unsure whether a skill, tool, or detail exists → assume it does NOT exist.
- It's better to omit something than to risk fabrication.
- Focus on truth, clarity, and relevance over keyword matching.
- Always aim for comprehensive coverage of the user's background to meet the 350-word minimum.

Return ONLY valid JSON. No explanations or extra text.
`;


const userPrompt = `
JOB DESCRIPTION:
${jobDescription}

USER PROFILE DATA:
${JSON.stringify(userProfileData, null, 2)}

INSTRUCTIONS:
Using the job description above, tailor the resume strictly using the data provided.
Select and reorder the most relevant items — do not invent or assume.

CRITICAL:
- Do not modify factual details like names, titles, dates, institutions, or degrees.
- Do not fabricate achievements, results, or metrics.
- Use only projects, experiences, and education that exist in the user's data.
- When incorporating soft skills, only include those that can logically fit with the user's real experience.
- Use HTML formatting for better readability: Use <b> for key skills/technologies/metrics, <ul><li> or <ol><li> for lists of accomplishments.
- FORMAT KEY AREAS: Make skills, technologies, and achievements stand out with BOLD formatting. Structure descriptions with bullet points for easy scanning.
- PRESERVE ALL LINKS: Keep all HTML anchor tags (<a href>) intact in project descriptions. Do not remove demo links, live site links, GitHub links, or any other URLs.

MINIMUM 350-WORD REQUIREMENT:
- The resume MUST contain at least 350 words total across professional_summary, experience descriptions, and project descriptions.
- PROJECTS: Include  3 most relevant projects initially.
- To meet the 350-word minimum: If the user has work experience, expand the Experience section descriptions with more detail instead of adding more projects.
- ONLY add more than 3 projects if the user has NO work experience AND you need to reach the 350-word minimum.
- Include JD-matching content first, prioritizing Experience expansion over adding more projects.

If certain JD requirements don't match any part of the user's data, simply omit them.

Return the response in this exact JSON structure:
{
  "professional_summary": "2–3 sentence factual summary using only the user's actual experience, tailored for this job.",
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
      "description": "Only rephrased, not fabricated. May include relevant soft skills naturally if appropriate.",
      "is_current": "EXACT is_current value from user's data"
    }
  ],
  "project": [
    {
      "name": "EXACT name from user's data",
      "type": "EXACT type from user's data",
      "description": "Only rephrased for clarity or relevance — do not add new content. MUST preserve all HTML links (<a href>) exactly as they appear in the original data."
    }
  ],
  "education": [
    {
      "institution": "EXACT institution from user's data",
      "degree": "EXACT degree from user's data",
      "field": "EXACT field from user's data",
      "graduation_date": "EXACT graduation_date from user's data",
      "gpa": "EXACT gpa from user's data"
    }
  ]
}
`;


        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.5
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