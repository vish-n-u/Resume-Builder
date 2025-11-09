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

// controller for handling custom user prompts
// POST: /api/ai/custom-prompt
export const handleCustomPrompt = async (req, res) => {
    try {
        const { userPrompt, currentResumeData } = req.body;
        const userId = req.userId;

        if (!userPrompt) {
            return res.status(400).json({ message: 'Custom prompt is required' });
        }

        // STEP 1: Classify the request to check if it's supported
        const classificationPrompt = `You are a request classifier for a resume builder AI assistant.

Your task is to determine if a user's request is SUPPORTED or UNSUPPORTED.

SUPPORTED requests are those that ask to modify or generate CONTENT:
- Add/modify/remove sections (experience, projects, skills, education, certifications, achievements, custom sections)
- Generate or update text content (professional summary, descriptions, etc.)
- Add specific information to the resume (new projects, skills, certifications, etc.)
- Reformat existing content (add bold, italics, bullet points to TEXT content)
- Update or improve existing content

UNSUPPORTED requests are those that ask for UI/styling changes that are NOT content-related:
- Change resume template/format (e.g., "change to modern template", "use a different layout")
- Change colors or styling (e.g., "make it blue", "change the color scheme", "change accent color")
- Change fonts or font sizes
- Change page layout or structure
- Any visual/design changes that are not about the text content itself

EXAMPLES:

SUPPORTED:
- "Add a project about building an e-commerce website"
- "Update my professional summary to emphasize leadership"
- "Add AWS certification to my resume"
- "Make the skills in my experience descriptions bold"
- "Add bullet points to my project descriptions"
- "Generate 3 achievements highlighting my teamwork"

UNSUPPORTED:
- "Change the resume template to modern"
- "Make the resume blue"
- "Change to a different format"
- "Use a different layout"
- "Change the font to Arial"
- "Make the resume colorful"
- "Rearrange the sections on the page"

Analyze the user's request and respond with ONLY valid JSON in this exact format:
{
  "supported": true/false,
  "reason": "Brief explanation of why this request is supported or unsupported",
  "suggestion": "If unsupported, provide guidance on how to achieve what they want using the UI controls"
}`;

        const classificationResponse = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: classificationPrompt },
                { role: "user", content: `USER REQUEST: "${userPrompt}"` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });

        const classification = JSON.parse(classificationResponse.choices[0].message.content);
        console.log("Request classification:", classification);

        // If request is not supported, return early with explanation
        if (!classification.supported) {
            return res.status(200).json({
                supported: false,
                reason: classification.reason,
                suggestion: classification.suggestion
            });
        }

        // STEP 2: Understand the user's intent and create an enhanced, detailed prompt
        const understandingPrompt = `You are an AI assistant that analyzes user requests for resume modifications and creates clearer, more detailed instructions.

Your task is to:
1. Understand what the user wants to do
2. Identify which section(s) and items they're referring to (if applicable)
3. Create a detailed, enhanced prompt that clarifies their intent

EXAMPLES:

Input: "highlight skills in my 2nd job"
Current Resume Context: User has 3 experience entries
Output:
{
  "enhanced_prompt": "In the second experience entry (the 2nd job in the experience array), identify all technical skills, programming languages, tools, and technologies mentioned in the description field, and wrap them in bold HTML tags (<b></b>) to make them stand out. Keep the rest of the description unchanged."
}

Input: "add a project about e-commerce"
Output:
{
  "enhanced_prompt": "Create a new project entry about building an e-commerce website. Include relevant technologies commonly used for e-commerce (like payment integration, shopping cart, product catalog). Make it professional and realistic with a good description."
}

Input: "improve my first experience"
Current Resume Context: User has 2 experience entries
Output:
{
  "enhanced_prompt": "Take the first experience entry (index 0) and improve its description to make it more impactful and professional. Use stronger action verbs, add more specific details, and make achievements more prominent. Keep the core facts the same (company, position, dates) but enhance the description content."
}

Input: "make my projects more readable"
Current Resume Context: User has 4 projects
Output:
{
  "enhanced_prompt": "Format all project descriptions to be more readable by adding HTML structure. Use bullet points (<ul><li>) for listing features or accomplishments, and bold key technologies. Apply this formatting to all projects in the array."
}

IMPORTANT:
- Be specific about which items to modify (e.g., "second entry", "all items", "first project")
- Mention array positions when relevant (e.g., "index 0", "the 2nd item")
- Describe what to change and how (formatting, content, etc.)
- Keep instructions natural and descriptive, not rigid or rule-based
- Focus on clarifying the user's intent in plain language

Analyze this user request and respond with ONLY valid JSON:`;

        const understandingResponse = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: understandingPrompt },
                {
                    role: "user",
                    content: `USER REQUEST: "${userPrompt}"

CURRENT RESUME STRUCTURE FOR CONTEXT:
- Experience entries: ${currentResumeData.experience?.length || 0} items
${currentResumeData.experience?.map((exp, i) => `  ${i + 1}. ${exp.position} at ${exp.company}`).join('\n') || ''}

- Project entries: ${currentResumeData.project?.length || 0} items
${currentResumeData.project?.map((proj, i) => `  ${i + 1}. ${proj.name}`).join('\n') || ''}

- Skills: ${currentResumeData.skills?.length || 0} items
- Education entries: ${currentResumeData.education?.length || 0} items
- Certifications: ${currentResumeData.certifications?.length || 0} items
- Achievements: ${currentResumeData.achievements?.length || 0} items

Create an enhanced, detailed prompt that clarifies what the user wants to do.`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });

        const understanding = JSON.parse(understandingResponse.choices[0].message.content);
        console.log("Enhanced prompt:", understanding.enhanced_prompt);

        // STEP 3: If supported, proceed with content generation using the clarified instruction
        // Get user's detailed resume data for additional context
        const detailedResume = await DetailedResume.findOne({ userId });

        const systemPrompt = `You are an expert resume AI assistant that helps users modify and enhance their resumes.

PRIMARY OBJECTIVE:
Generate resume content based on the user's request while maintaining the exact JSON structure required by the frontend application.

CRITICAL RULES:
1. Carefully read the user's request to understand what they want
2. Use the current resume data as context - you'll see all existing content
3. Maintain professional, ATS-friendly language
4. Use HTML formatting when appropriate (<b>, <i>, <ul>, <li>, <ol>)
5. Return ONLY the sections that need to be updated/added
6. Do not fabricate unrealistic information - keep content professional and believable
7. When modifying specific items, preserve the structure and other fields

RESUME DATA STRUCTURE:
- professional_summary: String (1-3 sentences)
- skills: Array of strings
- experience: Array of objects with {company, position, start_date, end_date, description, is_current}
- project: Array of objects with {name, type, description}
- education: Array of objects with {institution, degree, field, graduation_date, gpa}
- certifications: Array of objects with {name, issuer, date, credential_id}
- achievements: Array of objects with {title, description}
- custom_sections: Array of objects with {section_name, content}

ACTION TYPES - Choose based on what makes sense:

1. "add" - When ADDING NEW items:
   - Use when creating new projects, skills, experiences, etc.
   - Return ONLY the new items to append
   - Example: Adding a new project or certification

2. "replace" - When MODIFYING EXISTING items:
   - Use when updating, formatting, or enhancing existing content
   - Return ALL items in the array (both changed and unchanged)
   - The frontend will replace the entire section
   - Example: Formatting descriptions, enhancing content, adding bold/bullets

3. "update" - When UPDATING a single string field:
   - Use for professional_summary or other non-array fields
   - Return just the new value

GUIDELINES:
- If modifying a specific item (like "2nd job"), make sure to return all items in that array with changes applied to the target
- If adding new content, return only the new items
- Be smart about HTML formatting - use it to improve readability
- Keep the original data intact unless specifically asked to change it

Return ONLY valid JSON in this structure:
{
  "action": "add" | "update" | "replace",
  "sections": {
    "professional_summary": "...",
    "skills": [...],
    "experience": [...],
    "project": [...],
    "education": [...],
    "certifications": [...],
    "achievements": [...],
    "custom_sections": [...]
  }
}`;

        const userPromptContent = `USER'S REQUEST (Enhanced and Clarified):
${understanding.enhanced_prompt}

CURRENT RESUME DATA:
${JSON.stringify(currentResumeData, null, 2)}

${detailedResume ? `USER'S PROFILE DATA (for additional context when creating new content):
${JSON.stringify({
    professional_summary: detailedResume.professional_summary,
    skills: detailedResume.skills,
    experience: detailedResume.experience?.map(e => ({ company: e.company, position: e.position })),
    education: detailedResume.education
}, null, 2)}` : ''}

INSTRUCTIONS:
1. Read the enhanced request carefully - it clarifies what the user wants
2. Look at the current resume data to see what exists
3. Decide the appropriate action type (add/replace/update) based on what makes sense
4. Generate the content following the request
5. Return it in the proper JSON format

Remember:
- If adding new items: return only new items with action "add"
- If modifying existing items: return ALL items in that section with action "replace" (make changes where needed)
- If updating a string field: return the new value with action "update"
- Be smart and flexible - use your judgment to do what the user wants`;

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPromptContent }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        const generatedContent = JSON.parse(response.choices[0].message.content);
        console.log("AI generated custom content:", generatedContent);

        // Process the generated content based on the action
        let generatedData = {};
        const action = generatedContent.action || 'update';
        const sections = generatedContent.sections || {};

        if (action === 'add') {
            // For 'add' action, we need to append to existing arrays
            generatedData = { ...currentResumeData };

            Object.keys(sections).forEach(key => {
                if (Array.isArray(sections[key]) && Array.isArray(currentResumeData[key])) {
                    generatedData[key] = [...currentResumeData[key], ...sections[key]];
                } else if (Array.isArray(sections[key])) {
                    generatedData[key] = sections[key];
                } else {
                    generatedData[key] = sections[key];
                }
            });
        } else if (action === 'replace') {
            // For 'replace' action, completely replace the sections
            generatedData = { ...currentResumeData, ...sections };
        } else {
            // For 'update' action (default), merge the data
            generatedData = { ...currentResumeData };

            Object.keys(sections).forEach(key => {
                if (Array.isArray(sections[key]) && sections[key].length > 0) {
                    // For arrays, append new items
                    generatedData[key] = [...(currentResumeData[key] || []), ...sections[key]];
                } else {
                    // For strings and other types, replace
                    generatedData[key] = sections[key];
                }
            });
        }

        return res.status(200).json({
            supported: true,
            message: 'Content generated successfully',
            generatedData,
            action,
            understanding: {
                enhanced_prompt: understanding.enhanced_prompt
            } // Include the enhanced prompt for frontend display
        });

    } catch (error) {
        console.error("Error handling custom prompt:", error);
        return res.status(400).json({ message: error.message });
    }
}

// controller for extracting job requirements from job description
// POST: /api/ai/extract-job-requirements
export const extractJobRequirements = async (req, res) => {
    try {
        const { jobDescription } = req.body;

        if(!jobDescription || jobDescription.trim() === ''){
            return res.status(400).json({message: 'Job description is required'})
        }

        const systemPrompt = `You are an expert AI Agent specialized in analyzing job descriptions and extracting key requirements. Extract the following information from the job description and provide it in a structured JSON format.`;

        const userPrompt = `Analyze this job description and extract the following information:

Job Description:
${jobDescription}

Extract and provide the data in the following JSON format with no additional text before or after:

{
  "workplaceLocation": "string - the location of the job (include if remote/hybrid/on-site if mentioned)",
  "applicationType": "string - 'email' or 'portal' or 'both' based on how to apply",
  "applicationEmail": "string - email address if mentioned for applications",
  "portalUrl": "string - application portal URL if mentioned",
  "requiredCertifications": "string - list of required certifications, each on a new line",
  "requiredSkills": "string - list of required technical and soft skills, each on a new line",
  "experience": "string - years or type of experience required (e.g., '3-5 years in software development')",
  "education": "string - educational requirements (e.g., 'Bachelor's in Computer Science')",
  "additionalRequirements": "string - any other requirements, preferences, or nice-to-haves"
}

Instructions:
1. Extract information only if explicitly mentioned or clearly implied in the job description
2. Use empty string "" if information is not found
3. For skills and certifications, list each on a new line
4. Be thorough and extract all relevant details
5. Ensure the response is valid JSON with no additional commentary`;

       const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });

        const extractedRequirements = JSON.parse(response.choices[0].message.content);

        return res.status(200).json({
            success: true,
            requirements: extractedRequirements
        });

    } catch (error) {
        console.error("Error extracting job requirements:", error);
        return res.status(400).json({message: error.message})
    }
}