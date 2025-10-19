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
- **User Management**: Registration, authentication, and authorization
- **Resume CRUD Operations**: Create, read, update, and delete resumes
- **AI Enhancement**: Automated content improvement using OpenAI
- **PDF Processing**: Extract resume data from uploaded PDFs
- **Template System**: Multiple customizable resume templates
- **Image Management**: Profile photo upload with background removal
- **Sharing**: Public/private resume sharing capabilities

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
│  │              │  │ - ImageKit                       │         │
│  │              │  │ - Multer (File Upload)           │         │
│  └──────────────┘  └──────────────────────────────────┘         │
└───────────────┬───────────────────┬────────────────┬────────────┘
                │                   │                │
                │                   │                │
    ┌───────────▼────────┐  ┌───────▼──────┐  ┌─────▼──────┐
    │   MongoDB Atlas    │  │  OpenAI API  │  │  ImageKit  │
    │                    │  │              │  │            │
    │ - Users Collection │  │ - GPT Models │  │ - Images   │
    │ - Resumes Coll.    │  │ - JSON Mode  │  │ - BG Rem.  │
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

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | Runtime Environment |
| Express | 5.1.0 | Web Framework |
| Mongoose | 8.18.3 | MongoDB ODM |
| OpenAI | 6.1.0 | AI Integration |
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
│   │   ├── ColorPicker.jsx     # Color customization
│   │   ├── EducationForm.jsx   # Education section form
│   │   ├── ExperienceForm.jsx  # Work experience form
│   │   ├── Loader.jsx          # Loading component
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── PersonalInfoForm.jsx # Personal info form
│   │   ├── ProfessionalSummaryForm.jsx # Summary form
│   │   ├── ProjectForm.jsx     # Projects form
│   │   ├── ResumePreview.jsx   # Live resume preview
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

#### Resume Routes
**Base Path**: `/api/resumes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create` | Yes | Create new resume |
| GET | `/get/:resumeId` | No* | Get resume by ID |
| PUT | `/update` | Yes | Update resume |
| DELETE | `/delete/:resumeId` | Yes | Delete resume |

*Note: Public resumes can be accessed without auth

#### AI Routes
**Base Path**: `/api/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/enhance-pro-sum` | Yes | Enhance professional summary |
| POST | `/enhance-job-desc` | Yes | Enhance job description |
| POST | `/upload-resume` | Yes | Upload and parse PDF resume |

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
  personal_info: {
    full_name: String,
    profession: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    website: String
  },
  experience: [...],
  project: [...],
  education: [...]
}
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
│   └── /app/builder/:resumeId (Resume Builder)
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
3. **User Experience**: Real-time preview, AI enhancements
4. **Modern Stack**: Latest versions of React, Node.js
5. **Flexibility**: Multiple templates, customization options
6. **Performance**: Vite for fast development, optimized builds

---

## Recommended Improvements

1. **TypeScript Migration**: Add type safety
2. **Testing**: Unit tests (Jest), integration tests (Supertest), E2E (Cypress)
3. **Error Boundaries**: React error boundaries for graceful failures
4. **Loading States**: Skeleton screens, better UX
5. **Form Validation**: Client and server-side validation
6. **Caching**: Redis for session management
7. **Logging**: Winston or Morgan for comprehensive logging
8. **Monitoring**: Application performance monitoring (APM)
9. **Documentation**: API documentation (Swagger/OpenAPI)
10. **CI/CD**: Automated testing and deployment pipelines

---

## Conclusion

This Resume Builder application demonstrates a well-structured full-stack architecture with modern web technologies. The integration of AI capabilities for content enhancement and PDF parsing adds significant value. The modular design allows for easy maintenance and scalability, while the use of Redux and React best practices ensures a maintainable codebase.

The application successfully combines multiple external services (MongoDB, OpenAI, ImageKit) into a cohesive user experience, showcasing competency in system integration and API design.

---

**Document Version**: 1.0
**Last Updated**: October 2025
**Maintained By**: Development Team
