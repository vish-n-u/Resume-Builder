# Resume Builder - Application Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Data Models](#data-models)
7. [API Architecture](#api-architecture)
8. [Authentication Flow](#authentication-flow)
9. [Resume Creation Flow](#resume-creation-flow)
10. [AI Integration](#ai-integration)
11. [State Management](#state-management)
12. [Routing Structure](#routing-structure)
13. [Security Considerations](#security-considerations)
14. [Deployment Architecture](#deployment-architecture)

---

## System Overview

The Resume Builder is a full-stack web application that enables users to create, customize, and manage professional resumes using AI-powered enhancements. The application follows a **client-server architecture** with a React-based frontend and Node.js/Express backend, connected to MongoDB for data persistence and OpenAI for AI capabilities.

### Key Capabilities
- **User Management**: Registration, authentication, authorization, and profile management
- **Resume CRUD Operations**: Create, read, update, and delete resumes
- **AI Enhancement**: Automated content improvement using OpenAI
- **AI-Powered Resume Tailoring**: Create job-specific resumes based on job descriptions
- **AI Job Description Suggestions**: Get intelligent suggestions for resume content based on job postings
- **PDF Processing**: Extract resume data from uploaded PDFs
- **Default Resume Data**: Store and manage user's master resume data for quick resume creation
- **Template System**: Multiple customizable resume templates
- **Rich Text Editor**: Quill-based text editor for detailed content formatting
- **Image Management**: Profile photo upload with background removal
- **Sharing**: Public/private resume sharing capabilities
- **SEO Optimization**: Meta tags and structured data for public resumes
- **Extended Sections**: Certifications, achievements, and custom sections support

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                     (React + Vite + Redux)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Pages      │  │  Components  │  │  Redux Store │          │
│  │              │  │              │  │              │          │
│  │ - Home       │  │ - Forms      │  │ - Auth Slice │          │
│  │ - Dashboard  │  │ - Templates  │  │              │          │
│  │ - Builder    │  │ - Preview    │  └──────────────┘          │
│  │ - Login      │  │ - Navbar     │                             │
│  └──────────────┘  └──────────────┘                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │           Axios API Client (configs/api.js)          │       │
│  └──────────────────────────────────────────────────────┘       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS (REST API)
                            │ JSON + JWT Authentication
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                        SERVER LAYER                              │
│                   (Node.js + Express)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Routes     │  │ Controllers  │  │ Middlewares  │          │
│  │              │  │              │  │              │          │
│  │ - User       │  │ - User       │  │ - Auth       │          │
│  │ - Resume     │  │ - Resume     │  │              │          │
│  │ - AI         │  │ - AI         │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────────────────────────┐         │
│  │   Models     │  │        Configurations            │         │
│  │              │  │                                  │         │
│  │ - User       │  │ - Database (MongoDB)             │         │
│  │ - Resume     │  │ - AI (OpenAI)                    │         │
│  │ - Detailed   │  │ - ImageKit                       │         │
│  │   Resume     │  │ - Multer (File Upload)           │         │
│  └──────────────┘  └──────────────────────────────────┘         │
└───────────────┬───────────────────┬────────────────┬────────────┘
                │                   │                │
                │                   │                │
    ┌───────────▼────────┐  ┌───────▼──────┐  ┌─────▼──────┐
    │   MongoDB Atlas    │  │  OpenAI API  │  │  ImageKit  │
    │                    │  │              │  │            │
    │ - Users Collection │  │ - GPT Models │  │ - Images   │
    │ - Resumes Coll.    │  │ - JSON Mode  │  │ - BG Rem.  │
    │ - DetailedResumes  │  │ - Tailoring  │  │            │
    └────────────────────┘  └──────────────┘  └────────────┘
```

---

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI Framework |
| Vite | 7.1.7 | Build Tool & Dev Server |
| Redux Toolkit | 2.9.0 | State Management |
| React Redux | 9.2.0 | React-Redux Bindings |
| React Router DOM | 7.9.3 | Client-side Routing |
| TailwindCSS | 4.1.13 | Utility-first CSS Framework |
| Axios | 1.12.2 | HTTP Client |
| Lucide React | 0.544.0 | Icon Library |
| React Hot Toast | 2.6.0 | Toast Notifications |
| React PDF to Text | 1.3.4 | PDF Text Extraction |
| jsPDF | 3.0.3 | PDF Generation |
| jsPDF AutoTable | 5.0.2 | PDF Table Generation |
| Quill | 2.0.3 | Rich Text Editor Core |
| React Quill New | 3.6.0 | React Wrapper for Quill |
| React Helmet Async | 2.0.5 | SEO Meta Tags Management |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | Runtime Environment |
| Express | 5.1.0 | Web Framework |
| Mongoose | 8.18.3 | MongoDB ODM |
| OpenAI | 6.5.0 | AI Integration |
| JWT | 9.0.2 | Authentication Tokens |
| bcrypt | 6.0.0 | Password Hashing |
| ImageKit | 7.1.0 | Image Storage & Processing |
| Multer | 2.0.2 | File Upload Handling |
| CORS | 2.8.5 | Cross-Origin Resource Sharing |
| dotenv | 17.2.3 | Environment Variables |

### Database
- **MongoDB Atlas**: Cloud-hosted NoSQL database

### External Services
- **OpenAI API**: AI-powered content enhancement
- **ImageKit**: Image CDN and processing

---

## Project Structure

### Client Directory Structure
```
client/
├── public/                      # Static assets
├── src/
│   ├── app/                     # Redux configuration
│   │   ├── store.js            # Redux store setup
│   │   └── features/
│   │       └── authSlice.js    # Authentication state slice
│   │
│   ├── assets/                  # Static resources
│   │   ├── assets.js           # Asset exports
│   │   └── templates/          # Template preview components
│   │       ├── ClassicTemplate.jsx
│   │       ├── MinimalTemplate.jsx
│   │       ├── ModernTemplate.jsx
│   │       └── MinimalImageTemplate.jsx
│   │
│   ├── components/              # Reusable components
│   │   ├── home/               # Landing page components
│   │   │   ├── Banner.jsx
│   │   │   ├── CallToAction.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Testimonial.jsx
│   │   │   └── Title.jsx
│   │   │
│   │   ├── templates/          # Resume rendering templates
│   │   │   ├── ClassicTemplate.jsx
│   │   │   ├── MinimalTemplate.jsx
│   │   │   ├── ModernTemplate.jsx
│   │   │   └── MinimalImageTemplate.jsx
│   │   │
│   │   ├── AchievementsForm.jsx # Achievements section form
│   │   ├── CertificationsForm.jsx # Certifications section form
│   │   ├── ColorPicker.jsx     # Color customization
│   │   ├── CustomSectionsForm.jsx # Custom sections form
│   │   ├── EducationForm.jsx   # Education section form
│   │   ├── ExperienceForm.jsx  # Work experience form
│   │   ├── Loader.jsx          # Loading component
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── PersonalInfoForm.jsx # Personal info form
│   │   ├── ProfessionalSummaryForm.jsx # Summary form
│   │   ├── ProjectForm.jsx     # Projects form
│   │   ├── QuillTextEditor.jsx # Rich text editor component
│   │   ├── ResumePreview.jsx   # Live resume preview
│   │   ├── SEO.jsx             # SEO meta tags component
│   │   ├── SkillsForm.jsx      # Skills section form
│   │   └── TemplateSelector.jsx # Template picker
│   │
│   ├── configs/
│   │   └── api.js              # Axios instance configuration
│   │
│   ├── pages/                   # Route pages
│   │   ├── Home.jsx            # Landing page
│   │   ├── Dashboard.jsx       # User dashboard
│   │   ├── ResumeBuilder.jsx   # Resume editor
│   │   ├── UserProfile.jsx     # User profile management
│   │   ├── Preview.jsx         # Public resume view
│   │   ├── Login.jsx           # Auth page
│   │   └── Layout.jsx          # Protected routes layout
│   │
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles
│
├── .env                         # Environment variables
├── .gitignore
├── eslint.config.js            # ESLint configuration
├── index.html                   # HTML template
├── package.json
├── README.md
└── vite.config.js              # Vite configuration
```

### Server Directory Structure
```
server/
├── configs/                     # Configuration files
│   ├── ai.js                   # OpenAI setup
│   ├── db.js                   # MongoDB connection
│   ├── imageKit.js             # ImageKit configuration
│   └── multer.js               # File upload setup
│
├── controllers/                 # Business logic
│   ├── aiController.js         # AI enhancement logic
│   ├── resumeController.js     # Resume CRUD operations
│   └── userController.js       # User authentication logic
│
├── middlewares/                 # Custom middleware
│   └── authMiddleware.js       # JWT verification
│
├── models/                      # Database schemas
│   ├── Resume.js               # Resume schema
│   ├── DetailedResume.js       # Default resume data schema
│   └── User.js                 # User schema
│
├── routes/                      # API routes
│   ├── aiRoutes.js             # AI endpoints
│   ├── resumeRoutes.js         # Resume endpoints
│   └── userRoutes.js           # User endpoints
│
├── .env                         # Environment variables
├── package.json
└── server.js                    # Application entry point
```

---

## Core Components

### 1. Authentication System

#### User Registration & Login Flow
```javascript
// Location: server/controllers/userController.js

Registration:
1. Receive user credentials (name, email, password)
2. Hash password using bcrypt
3. Create user document in MongoDB
4. Generate JWT token
5. Return token + user data

Login:
1. Receive credentials (email, password)
2. Query user by email
3. Compare password hash using bcrypt
4. Generate JWT token
5. Return token + user data
```

#### Auth Middleware
```javascript
// Location: server/middlewares/authMiddleware.js

Purpose: Protect routes requiring authentication
Process:
1. Extract token from Authorization header
2. Verify token using JWT_SECRET
3. Decode userId from token payload
4. Attach userId to request object
5. Pass control to next middleware/controller
```

### 2. Resume Builder Components

#### PersonalInfoForm (client/src/components/PersonalInfoForm.jsx)
- **Props**: `data`, `onChange`, `removeBackground`, `setRemoveBackground`
- **Fields**: Full name, profession, email, phone, location, LinkedIn, website, image
- **Features**: Image upload, background removal toggle

#### ProfessionalSummaryForm (client/src/components/ProfessionalSummaryForm.jsx)
- **Props**: `data`, `onChange`, `setResumeData`
- **Fields**: Textarea for professional summary
- **Features**: AI enhancement button, character counter

#### ExperienceForm (client/src/components/ExperienceForm.jsx)
- **Props**: `data`, `onChange`
- **Fields**: Company, position, dates, description, current job checkbox
- **Features**: Dynamic array management, AI enhancement, add/remove entries

#### EducationForm (client/src/components/EducationForm.jsx)
- **Props**: `data`, `onChange`
- **Fields**: Institution, degree, field, graduation date, GPA
- **Features**: Dynamic array management

#### ProjectForm (client/src/components/ProjectForm.jsx)
- **Props**: `data`, `onChange`
- **Fields**: Project name, type, description
- **Features**: Dynamic array management

#### SkillsForm (client/src/components/SkillsForm.jsx)
- **Props**: `data`, `onChange`
- **Fields**: Skills as tags
- **Features**: Add/remove skills, tag-based UI

#### CertificationsForm (client/src/components/CertificationsForm.jsx)
- **Props**: `data`, `onChange`
- **Fields**: Certification name, issuer, date, credential ID
- **Features**: Dynamic array management, add/remove entries

#### AchievementsForm (client/src/components/AchievementsForm.jsx)
- **Props**: `data`, `onChange`
- **Fields**: Achievement title, description
- **Features**: Dynamic array management, add/remove entries

#### CustomSectionsForm (client/src/components/CustomSectionsForm.jsx)
- **Props**: `data`, `onChange`
- **Fields**: Section name, content (with rich text editor)
- **Features**: Dynamic custom sections, reorderable, rich text editing

#### QuillTextEditor (client/src/components/QuillTextEditor.jsx)
- **Props**: `value`, `onChange`, `placeholder`
- **Purpose**: Rich text editor for formatted content
- **Features**: HTML formatting, toolbar for text styling

#### SEO (client/src/components/SEO.jsx)
- **Props**: `title`, `description`, `keywords`, `canonicalUrl`
- **Purpose**: Manage SEO meta tags for public resume pages
- **Features**: Dynamic meta tags, OpenGraph tags, structured data

#### TemplateSelector (client/src/components/TemplateSelector.jsx)
- **Props**: `selectedTemplate`, `onChange`
- **Templates**: Classic, Minimal, Modern, Minimal-Image
- **Features**: Visual template preview

#### ColorPicker (client/src/components/ColorPicker.jsx)
- **Props**: `selectedColor`, `onChange`
- **Features**: Predefined color palette, accent color customization

#### ResumePreview (client/src/components/ResumePreview.jsx)
- **Props**: `data`, `template`, `accentColor`
- **Purpose**: Live preview of resume with selected template
- **Features**: Template switching, color theming

### 3. Page Components

#### Dashboard (client/src/pages/Dashboard.jsx:96-194)
**Responsibilities**:
- Display all user resumes in grid layout
- Create new blank resume
- Upload existing PDF resume
- Edit resume titles
- Delete resumes
- Navigate to resume builder

**Key Functions**:
- `loadAllResumes()`: Fetch user's resumes from API
- `createResume()`: Create blank resume, navigate to builder
- `uploadResume()`: Extract text from PDF, send to AI, create resume
- `editTitle()`: Update resume title
- `deleteResume()`: Delete resume with confirmation

#### ResumeBuilder (client/src/pages/ResumeBuilder.jsx:122-213)
**Responsibilities**:
- Multi-step resume editing interface
- Real-time preview
- Template and color customization
- Save functionality
- Share and download features

**Key Functions**:
- `loadExistingResume()`: Load resume data by ID
- `saveResume()`: Save changes to database
- `changeResumeVisibility()`: Toggle public/private
- `handleShare()`: Share resume using Web Share API
- `downloadResume()`: Trigger print dialog

**State Management**:
- `resumeData`: Complete resume object
- `activeSectionIndex`: Current form section (0-5)
- `removeBackground`: Background removal flag

**Sections**:
1. Personal Info
2. Professional Summary
3. Experience
4. Education
5. Projects
6. Skills
7. Certifications
8. Achievements
9. Custom Sections

---

## Data Models

### User Schema
**Location**: `server/models/User.js`

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  timestamps: true
}

Methods:
- comparePassword(password): Boolean
```

### Resume Schema
**Location**: `server/models/Resume.js`

```javascript
{
  userId: ObjectId (ref: "User"),
  title: String (default: "Untitled Resume"),
  job_description: String (default: ""),
  public: Boolean (default: false),
  template: String (default: "classic"),
  accent_color: String (default: "#3B82F6"),

  professional_summary: String,
  skills: [String],

  personal_info: {
    image: String,
    full_name: String,
    profession: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    website: String
  },

  experience: [{
    company: String,
    position: String,
    start_date: String,
    end_date: String,
    description: String,
    is_current: Boolean
  }],

  project: [{
    name: String,
    type: String,
    description: String
  }],

  education: [{
    institution: String,
    degree: String,
    field: String,
    graduation_date: String,
    gpa: String
  }],

  timestamps: true,
  minimize: false
}
```

### DetailedResume Schema (Default Resume Data)
**Location**: `server/models/DetailedResume.js`

```javascript
{
  userId: ObjectId (ref: "User", required: true, unique: true),
  professional_summary: String (default: ''),
  skills: [String],

  personal_info: {
    image: String,
    full_name: String,
    profession: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    website: String
  },

  experience: [{
    company: String,
    position: String,
    start_date: String,
    end_date: String,
    description: String,
    is_current: Boolean
  }],

  project: [{
    name: String,
    type: String,
    description: String
  }],

  education: [{
    institution: String,
    degree: String,
    field: String,
    graduation_date: String,
    gpa: String
  }],

  certifications: [{
    name: String,
    issuer: String,
    date: String,
    credential_id: String
  }],

  achievements: [{
    title: String,
    description: String
  }],

  custom_sections: [{
    section_name: String,
    content: String
  }],

  timestamps: true,
  minimize: false
}

Purpose:
- Stores user's master/default resume data
- Used as the source for AI-powered resume tailoring
- One per user (unique constraint on userId)
- Can be populated via PDF upload or manual entry
- Includes extended sections (certifications, achievements, custom)
```

---

## API Architecture

### RESTful Endpoints

#### User Routes
**Base Path**: `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | User login |
| GET | `/data` | Yes | Get authenticated user data |
| GET | `/resumes` | Yes | Get all user's resumes |
| PUT | `/update` | Yes | Update user profile |
| PUT | `/change-password` | Yes | Change user password |
| GET | `/default-resume-data` | Yes | Get user's default resume data |
| PUT | `/update-default-resume-data` | Yes | Update default resume data (with image upload) |

#### Resume Routes
**Base Path**: `/api/resumes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create` | Yes | Create new resume |
| GET | `/get/:resumeId` | Yes | Get resume by ID (authenticated) |
| GET | `/public/:resumeId` | No | Get public resume by ID |
| PUT | `/update` | Yes | Update resume (with image upload) |
| DELETE | `/delete/:resumeId` | Yes | Delete resume |

#### AI Routes
**Base Path**: `/api/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/enhance-pro-sum` | Yes | Enhance professional summary |
| POST | `/enhance-job-desc` | Yes | Enhance job description |
| POST | `/suggest-job-desc` | Yes | Get AI suggestions based on job posting |
| POST | `/upload-resume` | Yes | Upload and parse PDF resume (creates new resume) |
| POST | `/upload-resume-to-profile` | Yes | Upload and parse PDF to default resume data |
| POST | `/tailor-resume` | Yes | Create tailored resume from job description |

### Request/Response Examples

#### Create Resume
```http
POST /api/resumes/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Software Engineer Resume"
}

Response:
{
  "resume": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Software Engineer Resume",
    "userId": "507f191e810c19729de860ea",
    "template": "classic",
    "accent_color": "#3B82F6",
    "public": false,
    ...
  }
}
```

#### Enhance Professional Summary
```http
POST /api/ai/enhance-pro-sum
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userContent": "I am a developer with 5 years experience"
}

Response:
{
  "enhancedContent": "Experienced software developer with 5+ years of expertise in full-stack development, specializing in modern web technologies and agile methodologies."
}
```

#### Upload Resume
```http
POST /api/ai/upload-resume
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My Resume",
  "resumeText": "John Doe\nSoftware Engineer\n..."
}

Response:
{
  "resumeId": "507f1f77bcf86cd799439011"
}
```

#### Upload Resume to Profile
```http
POST /api/ai/upload-resume-to-profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "resumeText": "John Doe\nSoftware Engineer\n..."
}

Response:
{
  "message": "Resume data saved to profile successfully"
}
```

#### Suggest Job Description
```http
POST /api/ai/suggest-job-desc
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentDescription": "Developed web applications",
  "jobDescription": "Full job posting text...",
  "position": "Senior Software Engineer",
  "company": "Tech Corp"
}

Response:
{
  "suggestions": [
    "Architected and deployed scalable microservices...",
    "Led cross-functional team of 5 developers...",
    "Reduced application load time by 40%...",
    "Implemented CI/CD pipeline reducing deployment time...",
    "Mentored junior developers on best practices..."
  ]
}
```

#### Tailor Resume
```http
POST /api/ai/tailor-resume
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Software Engineer - Tech Corp",
  "jobDescription": "We are looking for a Senior Software Engineer with experience in React, Node.js..."
}

Response:
{
  "message": "Tailored resume created successfully",
  "resumeId": "507f1f77bcf86cd799439012"
}
```

---

## Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /api/users/login
       │    { email, password }
       ▼
┌─────────────────────────────────────┐
│         User Controller             │
│  (server/controllers/userController)│
└──────┬──────────────────────────────┘
       │
       │ 2. Verify credentials
       │    - Query user by email
       │    - Compare password hash
       ▼
┌─────────────────┐
│   MongoDB       │
│  Users Coll.    │
└──────┬──────────┘
       │
       │ 3. User found
       ▼
┌─────────────────────────────────────┐
│      Generate JWT Token             │
│   jwt.sign({userId}, JWT_SECRET)    │
└──────┬──────────────────────────────┘
       │
       │ 4. Return token + user data
       ▼
┌─────────────┐
│   Client    │
│  - Store token in localStorage      │
│  - Update Redux auth state          │
└─────────────┘

┌───────────────────────────────────────────────────────┐
│            Subsequent API Requests                    │
└───────────────────────────────────────────────────────┘

┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. API Request
       │    Headers: { Authorization: token }
       ▼
┌─────────────────────────────────────┐
│       Auth Middleware               │
│  (server/middlewares/authMiddleware)│
└──────┬──────────────────────────────┘
       │
       │ 2. Verify JWT token
       │    jwt.verify(token, JWT_SECRET)
       ▼
┌─────────────────┐
│  Valid Token?   │
└────┬────────┬───┘
     │        │
   Yes        No
     │        │
     ▼        ▼
 Proceed   401 Error
     │
     ▼
┌─────────────────────────────────────┐
│     Controller Function             │
│  - Access req.userId                │
│  - Execute business logic           │
└─────────────────────────────────────┘
```

---

## Resume Creation Flow

### Method 1: Blank Resume Creation
```
User clicks "Create Resume" on Dashboard
           ↓
Modal opens for title input
           ↓
User enters title and submits
           ↓
POST /api/resumes/create { title }
           ↓
Server creates resume with default values
           ↓
Resume saved to MongoDB
           ↓
Client receives resume ID
           ↓
Navigate to /app/builder/:resumeId
           ↓
Load resume data and render builder
```

### Method 2: PDF Upload
```
User clicks "Upload Existing" on Dashboard
           ↓
Modal opens for title and file input
           ↓
User selects PDF file and enters title
           ↓
Client: react-pdftotext extracts text
           ↓
POST /api/ai/upload-resume { title, resumeText }
           ↓
Server: OpenAI extracts structured data
  - System prompt: "Extract resume data"
  - User prompt: resumeText + JSON schema
  - response_format: json_object
           ↓
OpenAI returns JSON with extracted data
           ↓
Server creates resume with extracted data
           ↓
Resume saved to MongoDB
           ↓
Client receives resume ID
           ↓
Navigate to /app/builder/:resumeId
           ↓
Load populated resume data
```

---

## AI Integration

### OpenAI Configuration
**Location**: `server/configs/ai.js`

```javascript
import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default ai;
```

### AI Controller Functions
**Location**: `server/controllers/aiController.js`

#### 1. Enhance Professional Summary
**Endpoint**: `POST /api/ai/enhance-pro-sum`

```javascript
Process:
1. Receive user's original summary text
2. Send to OpenAI with system prompt:
   "Expert resume writer, create ATS-friendly summary"
3. OpenAI enhances text
4. Return enhanced content
```

**System Prompt**:
```
"You are an expert in resume writing. Your task is to enhance the
professional summary of a resume. The summary should be 1-2 sentences
highlighting key skills, experience, and career objectives. Make it
compelling and ATS-friendly. Return text only, no options."
```

#### 2. Enhance Job Description
**Endpoint**: `POST /api/ai/enhance-job-desc`

```javascript
Process:
1. Receive user's job description
2. Send to OpenAI with system prompt
3. OpenAI improves with action verbs and metrics
4. Return enhanced content
```

**System Prompt**:
```
"You are an expert in resume writing. Your task is to enhance the job
description. Should be 1-2 sentences highlighting key responsibilities
and achievements. Use action verbs and quantifiable results. Make it
ATS-friendly. Return text only."
```

#### 3. Upload Resume (PDF Parsing)
**Endpoint**: `POST /api/ai/upload-resume`

```javascript
Process:
1. Receive PDF text and resume title
2. Build structured prompt with JSON schema
3. Call OpenAI with response_format: json_object
4. Parse returned JSON
5. Create resume in database
6. Return resume ID
```

**System Prompt**:
```
"You are an expert AI Agent to extract data from resume."
```

**User Prompt Template**:
```
Extract data from this resume: {resumeText}

Provide data in the following JSON format:
{
  professional_summary: String,
  skills: [String],
  personal_info: {...},
  experience: [...],
  project: [...],
  education: [...]
}
```

#### 4. Upload Resume to Profile (Onboarding)
**Endpoint**: `POST /api/ai/upload-resume-to-profile`

```javascript
Process:
1. Receive PDF text from user
2. Build structured prompt with extended JSON schema
3. Call OpenAI GPT-4o-mini with response_format: json_object
4. Parse returned JSON including certifications and achievements
5. Save/update DetailedResume (upsert operation)
6. Return success message

Key Difference from upload-resume:
- Saves to DetailedResume collection (default data)
- Includes certifications and achievements extraction
- Uses upsert to update existing default data
- Does not create a new resume document
```

**Extended Schema**:
```
Includes all standard fields plus:
- certifications: [{name, issuer, date, credential_id}]
- achievements: [{title, description}]
```

#### 5. Suggest Job Description
**Endpoint**: `POST /api/ai/suggest-job-desc`

```javascript
Process:
1. Receive job description, current description, position, company
2. Fetch user's DetailedResume for context
3. Build contextual prompt with user's background
4. Call OpenAI with temperature: 0.8 for creative suggestions
5. Return 5 actionable bullet point suggestions

AI Strategy:
- Analyzes job description for required skills/responsibilities
- Uses user's actual background as context
- Generates realistic, ATS-friendly suggestions
- Focuses on achievements and quantifiable results
- Keyword-optimized for the target job
```

**System Prompt**:
```
"You are an expert resume writer and career coach. Your task is to
provide 5 specific, actionable suggestions for job description bullet
points that align with the given job description..."
```

#### 6. Tailor Resume (AI-Powered Resume Customization)
**Endpoint**: `POST /api/ai/tailor-resume`

```javascript
Process:
1. Receive job description and desired resume title
2. Fetch user's DetailedResume (master data)
3. Build comprehensive prompt with strict guidelines
4. Call OpenAI with temperature: 0.5 for controlled creativity
5. Parse AI-generated tailored resume data
6. Create new Resume document with tailored content
7. Return new resume ID

AI Guidelines (Critical):
- Only reorganize/rephrase existing user data
- Never fabricate information
- Preserve factual details (dates, names, titles)
- Reorder content for job relevance
- Maintain 350+ word minimum across all sections
- Use minimal HTML formatting
- Preserve all links in project descriptions

Output:
- New resume optimized for specific job posting
- Prioritizes JD-matching content
- Includes job_description field for reference
```

**System Prompt Philosophy**:
```
"You are an expert resume tailoring AI that customizes resumes
strictly based on verified user data. Never fabricate, assume,
or infer information not explicitly present in the user's profile..."
```

---

## State Management

### Redux Store Configuration
**Location**: `client/src/app/store.js`

```javascript
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer
  }
})
```

### Auth Slice
**Location**: `client/src/app/features/authSlice.js`

```javascript
State Shape:
{
  user: null | Object,
  token: null | String,
  isLoading: Boolean
}

Actions:
- login({ token, user })
- logout()
- setLoading(Boolean)

Usage:
- Persist auth state across app
- Control protected route access
- Manage loading states
```

### Component-Level State

**Dashboard State**:
```javascript
- allResumes: Array of resume objects
- showCreateResume: Boolean for modal
- showUploadResume: Boolean for modal
- title: String for resume title
- resume: File object for upload
- editResumeId: String for editing
- isLoading: Boolean for upload process
```

**ResumeBuilder State**:
```javascript
- resumeData: Complete resume object
- activeSectionIndex: Number (0-5)
- removeBackground: Boolean for image processing
```

---

## User Profile & Default Resume Data Workflow

### Overview
The application implements a two-tier resume data system:
1. **DetailedResume**: User's master/default resume data
2. **Resume**: Individual resume instances (can be tailored for specific jobs)

### Default Resume Data Purpose
```
User Profile (DetailedResume)
         ↓
    Master Data
         ↓
    ┌────┴────┐
    ↓         ↓
Resume 1   Resume 2 (Tailored)
```

### Workflow

#### 1. Profile Setup (Onboarding)
```
User uploads PDF → AI extracts data → Saves to DetailedResume
                                    ↓
                        User can manually edit in /app/profile
```

#### 2. Creating Tailored Resumes
```
User pastes job description → AI reads DetailedResume
                            ↓
                    AI tailors content for job
                            ↓
                    Creates new Resume document
```

#### 3. AI Suggestions Flow
```
User editing experience description → Clicks "Get Suggestions"
                                   ↓
                    Provides job description context
                                   ↓
                    AI analyzes job + user's DetailedResume
                                   ↓
                    Returns 5 contextual suggestions
```

### Benefits
- **Single Source of Truth**: Maintain comprehensive profile data once
- **Quick Resume Creation**: Generate job-specific resumes from master data
- **Consistent Information**: Personal details consistent across all resumes
- **AI Context**: Better AI suggestions using complete background
- **Extended Sections**: Support for certifications, achievements, custom sections

### UserProfile Page Features
**Location**: `/app/profile`

**Capabilities**:
- View and edit default resume data
- Upload PDF to populate profile
- Manage certifications and achievements
- Create custom sections
- Update personal information
- Change password
- Profile photo management

---

## Routing Structure

### Client Routes
**Location**: `client/src/App.jsx`

```javascript
Route Hierarchy:
/
├── / (Home)
│
├── /app (Protected Layout)
│   ├── /app (Dashboard - index)
│   ├── /app/builder/:resumeId (Resume Builder)
│   └── /app/profile (User Profile)
│
└── /view/:resumeId (Public Preview)

Protected Routes:
- Wrapped in <Layout> component
- Requires authentication token
- Redirects to login if not authenticated
```

### Route Components

| Path | Component | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/` | Home.jsx | No | Landing page |
| `/app` | Layout.jsx → Dashboard.jsx | Yes | User dashboard |
| `/app/builder/:resumeId` | Layout.jsx → ResumeBuilder.jsx | Yes | Resume editor |
| `/app/profile` | Layout.jsx → UserProfile.jsx | Yes | User profile & default resume data |
| `/view/:resumeId` | Preview.jsx | No | Public resume view |

### Layout Component Pattern
```javascript
// Layout.jsx provides:
- Authentication check
- Common navigation (Navbar)
- Nested route rendering via <Outlet />
```

---

## Security Considerations

### 1. Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Signed with secret key, stored in localStorage
- **Token Verification**: Middleware validates all protected routes
- **User ID Injection**: Token payload contains userId, not exposed in URLs

### 2. Authorization
- **Resume Ownership**: User can only modify their own resumes
- **Private/Public Toggle**: Resumes private by default
- **Public View**: Anyone can view if marked public

### 3. Data Validation
- **Required Fields**: Enforced at schema level
- **Email Uniqueness**: Database constraint
- **Input Sanitization**: Mongoose handles basic sanitization

### 4. Environment Variables
```
Sensitive Data in .env:
- JWT_SECRET
- MONGODB_URI
- OPENAI_API_KEY
- IMAGEKIT_PUBLIC_KEY
- IMAGEKIT_PRIVATE_KEY
- IMAGEKIT_URL_ENDPOINT
```

### 5. CORS Configuration
```javascript
// Allows cross-origin requests from frontend
app.use(cors())
```

### 6. File Upload Security
- **File Type Restriction**: Only PDF files accepted
- **Multer Configuration**: File size limits, storage configuration
- **ImageKit Processing**: Images processed on external service

### 7. Known Vulnerabilities

⚠️ **Areas for Improvement**:
1. **No Input Validation**: Missing express-validator or Joi
2. **No Rate Limiting**: API endpoints vulnerable to abuse
3. **Weak JWT Secret**: "abcd" in .env (should be strong random string)
4. **No HTTPS Enforcement**: Should enforce secure connections
5. **Exposed Credentials**: .env file committed (use .env.example)
6. **No SQL Injection Protection**: MongoDB is safer but still needs validation
7. **No XSS Protection**: Missing helmet.js middleware
8. **localStorage for Tokens**: Vulnerable to XSS attacks (consider httpOnly cookies)

---

## Deployment Architecture

### Development Environment

**Client**:
```bash
cd client
npm install
npm run dev

Runs on: http://localhost:5173 (Vite default)
```

**Server**:
```bash
cd server
npm install
npm run server

Runs on: http://localhost:3000
```

### Environment Variables

**Client (.env)**:
```
VITE_BASE_URL=http://localhost:3000
```

**Server (.env)**:
```
JWT_SECRET=<strong_random_string>
MONGODB_URI=<mongodb_connection_string>
OPENAI_API_KEY=<openai_api_key>
OPENAI_MODEL=<model_name>
IMAGEKIT_PUBLIC_KEY=<public_key>
IMAGEKIT_PRIVATE_KEY=<private_key>
IMAGEKIT_URL_ENDPOINT=<url_endpoint>
PORT=3000
```

### Production Deployment Recommendations

**Frontend**:
```
Platform: Vercel, Netlify, or AWS S3 + CloudFront
Build: npm run build
Output: dist/
Environment Variables: VITE_BASE_URL (production API URL)
```

**Backend**:
```
Platform: AWS EC2, Heroku, Railway, or Render
Process: node server.js
Port: process.env.PORT
Database: MongoDB Atlas (already cloud-hosted)
Environment Variables: All production secrets
```

**External Services**:
- MongoDB Atlas: Production cluster
- OpenAI API: Production API key with rate limits
- ImageKit: Production account

### Database Connection
**Location**: `server/configs/db.js`

```javascript
import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    process.exit(1)
  }
}

export default connectDB
```

### Image Storage
**Location**: `server/configs/imageKit.js`

```javascript
import ImageKit from '@imagekit/nodejs'

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
})

export default imageKit
```

---

## Best Practices Implemented

✅ **Code Organization**:
- Separation of concerns (MVC pattern)
- Modular file structure
- Reusable components

✅ **Modern JavaScript**:
- ES6+ syntax
- ES Modules (import/export)
- Async/await for asynchronous operations

✅ **Error Handling**:
- Try-catch blocks in controllers
- Error responses with appropriate status codes
- User-friendly error messages via toast notifications

✅ **State Management**:
- Centralized Redux store
- Immutable state updates
- Efficient re-rendering

✅ **API Design**:
- RESTful endpoints
- Consistent response format
- Proper HTTP methods

✅ **Database**:
- Schema validation
- Relationships (User ↔ Resume)
- Timestamps for audit trail

---

## Architecture Strengths

1. **Scalability**: Modular structure allows easy feature additions
2. **Maintainability**: Clear separation of concerns
3. **User Experience**: Real-time preview, AI enhancements, tailored resumes
4. **Modern Stack**: Latest versions of React 19, Node.js, OpenAI API
5. **Flexibility**: Multiple templates, customization options, custom sections
6. **Performance**: Vite for fast development, optimized builds
7. **AI Integration**: Advanced features like resume tailoring and contextual suggestions
8. **Data Architecture**: Two-tier system (DetailedResume + Resume) for optimal workflow
9. **Rich Content**: Quill editor for formatted text, HTML support
10. **SEO Ready**: Meta tags and structured data for public resumes

---

## Recommended Improvements

### High Priority
1. **Security Hardening**:
   - Implement input validation (express-validator/Joi)
   - Add rate limiting (express-rate-limit)
   - Use strong JWT secret (not "abcd")
   - Implement helmet.js for security headers
   - Move to httpOnly cookies for token storage

2. **Testing**:
   - Unit tests (Jest/Vitest)
   - Integration tests (Supertest)
   - E2E tests (Playwright/Cypress)
   - AI prompt testing

3. **Error Handling**:
   - React error boundaries
   - Centralized error handling middleware
   - Better error messages and user feedback

### Medium Priority
4. **Performance**:
   - Implement caching (Redis)
   - Database query optimization
   - Image optimization and lazy loading
   - Code splitting and lazy loading

5. **UX Enhancements**:
   - Skeleton screens for loading states
   - Undo/redo functionality
   - Auto-save functionality
   - Drag-and-drop section reordering
   - Export to multiple formats (DOCX, TXT)

6. **AI Improvements**:
   - Token usage tracking and limits
   - AI response caching for common requests
   - Support for multiple AI models
   - Batch processing for multiple sections

### Low Priority
7. **Developer Experience**:
   - TypeScript migration
   - API documentation (Swagger/OpenAPI)
   - Comprehensive logging (Winston/Morgan)
   - CI/CD pipeline
   - Environment-based configuration

8. **Features**:
   - Resume analytics (views, downloads)
   - Resume version history
   - Collaboration features
   - Template marketplace
   - ATS score checker

---

## Recent Feature Additions (2025)

Based on recent commits, the following features have been added:

1. **SEO Optimization** (commit: ee378a5)
   - React Helmet Async integration
   - Dynamic meta tags for public resumes
   - OpenGraph tags for social sharing
   - Structured data for search engines

2. **Custom Sections** (commit: ee378a5)
   - User-defined resume sections
   - Rich text editor support
   - Reorderable sections
   - Flexible content formatting

3. **Project Sequencing** (commit: 972e21e)
   - Ability to reorder projects
   - Drag-and-drop functionality
   - Custom ordering persistence

4. **Hide Sections Feature** (commit: 82b7571)
   - Toggle visibility of resume sections
   - Conditional rendering in templates
   - User control over what to display

5. **AI Suggestion System** (commit: 2c51282)
   - Job description-based suggestions
   - Context-aware recommendations
   - 5 bullet point suggestions per request

6. **Certifications Section** (commit: 2c51282)
   - Dedicated certifications form
   - Fields: name, issuer, date, credential ID
   - AI extraction from uploaded resumes

7. **Rich Text Editor** (commit: 65a5400)
   - Quill-based text editor
   - HTML formatting support
   - Toolbar for text styling
   - Used in custom sections and descriptions

8. **Resume Tailoring** (Latest)
   - AI-powered job-specific resume creation
   - Uses DetailedResume as source data
   - Maintains factual accuracy
   - 350+ word minimum content requirement

---

## Conclusion

This Resume Builder application demonstrates a sophisticated full-stack architecture with cutting-edge AI integration. The application goes beyond basic CRUD operations to offer intelligent features like AI-powered resume tailoring, contextual job description suggestions, and comprehensive resume data management through a two-tier data architecture.

**Key Innovations**:
- **AI-Driven Customization**: Tailors resumes based on job descriptions while maintaining factual accuracy
- **Intelligent Suggestions**: Provides context-aware content recommendations
- **Flexible Content Management**: Rich text editing, custom sections, reorderable components
- **SEO Optimization**: Public resumes optimized for search engines
- **Modern Tech Stack**: React 19, OpenAI 6.5.0, latest tooling

The application successfully integrates multiple external services (MongoDB Atlas, OpenAI API, ImageKit) into a cohesive, user-friendly experience. The modular architecture, combined with Redux state management and React best practices, ensures maintainability and scalability.

**Real-World Impact**: This application solves genuine user problems by automating resume optimization, reducing time spent customizing resumes for different job applications, and providing AI-powered insights for better content.

---

**Document Version**: 2.0
**Last Updated**: January 2025
**Maintained By**: Development Team
**Major Updates**: Added AI tailoring, job suggestions, custom sections, SEO optimization, rich text editing, certifications, achievements, and default resume data management
