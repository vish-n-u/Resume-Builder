# Job Swipe Feature - Design Document

## Overview

Add a Tinder-style job swiping UI to the existing resume builder app. Users swipe through personalized job cards. Right-swiping triggers AI generation of a tailored resume + cover letter email, which the user previews/edits before sending via their connected Gmail or Outlook account.

## Architecture

Integrated into the existing React + Express + MongoDB stack as new modules (routes, controllers, models, pages, components). No separate services.

## Data Models

### Job (new)
Caches jobs fetched from the JSearch API.

```
Job {
  externalId: String (unique, API's job ID)
  title: String
  company: String
  location: String
  type: String (remote/onsite/hybrid)
  salary: String
  description: String
  skills: [String]
  applyUrl: String
  postedDate: Date
  source: String (e.g., "jsearch")
  fetchedAt: Date
}
```

### Application (new)
Tracks every right-swipe application.

```
Application {
  userId: ObjectId (ref User)
  jobId: ObjectId (ref Job)
  resumeId: ObjectId (ref Resume, the tailored resume)
  emailSubject: String
  emailBody: String
  recipientEmail: String
  status: String (draft/sent/failed)
  sentAt: Date
  createdAt: Date
}
```

### User (additions)
```
emailProvider: String (gmail/outlook/none)
oauthTokens: {
  accessToken: String (encrypted)
  refreshToken: String (encrypted)
  expiresAt: Date
}
dismissedJobs: [ObjectId] (ref Job)
```

## API Endpoints

### Job Endpoints
- `GET /api/jobs/feed` - Fetches personalized job cards (uses user's skills/experience to query JSearch, filters out dismissed + applied jobs)
- `POST /api/jobs/dismiss` - Left swipe: adds job to user's dismissedJobs

### Application Endpoints
- `POST /api/applications/prepare` - Right swipe: AI generates tailored resume + cover letter, returns preview
- `PUT /api/applications/:id/edit` - User edits email/resume in preview modal
- `POST /api/applications/:id/send` - Confirms and sends email via OAuth
- `GET /api/applications` - Lists all applications (Applied tracker)

### OAuth Endpoints
- `GET /api/email/auth/google` - Initiates Google OAuth consent flow
- `GET /api/email/auth/google/callback` - Handles callback, stores tokens
- `GET /api/email/auth/outlook` - Initiates Microsoft OAuth consent flow
- `GET /api/email/auth/outlook/callback` - Handles callback, stores tokens
- `GET /api/email/status` - Returns whether email is connected
- `DELETE /api/email/disconnect` - Removes OAuth tokens

## Right-Swipe Flow

1. User swipes right -> frontend calls `POST /api/applications/prepare` with jobId
2. Backend fetches user's resume data + job description -> sends to OpenAI -> generates tailored resume + email body
3. Returns preview (email + resume data) to frontend
4. User sees preview modal with editable email body + resume preview
5. User edits if needed -> calls `PUT /api/applications/:id/edit`
6. User confirms -> frontend generates PDF from rendered resume using html2canvas + jspdf
7. Frontend sends PDF blob + confirm to `POST /api/applications/:id/send`
8. Backend sends email via Gmail/Outlook API with resume PDF attached
9. Application status updated to "sent"

## Frontend Components

### New Pages
- `/jobs` - Main swipe UI (Tinder-style card stack)
- `/applied` - Applied jobs tracker
- Email connection settings (added to existing UserProfile or /settings)

### New Components
- `JobCard.jsx` - Single job card (title, company, location, type, description, skills)
- `SwipeContainer.jsx` - Card stack with swipe gestures + button controls
- `ApplicationPreview.jsx` - Modal: AI-generated email + resume preview, editable, send/cancel
- `AppliedTracker.jsx` - Table of applications with status, date, company, job title
- `EmailConnect.jsx` - OAuth connection UI: Connect Gmail / Connect Outlook buttons

### Swipe Interaction
- Drag gestures via `react-tinder-card` library
- Visual feedback: card tilt + green/red overlay on drag
- Keyboard support (arrow keys)
- Pre-fetch next batch when 3 cards remaining

### State Management
- New Redux slices: `jobsSlice` (feed cards, loading), `applicationsSlice` (applied list)

## AI Integration

### Resume Tailoring (reuses existing OpenAI setup)
- Takes user's DetailedResume data + job description
- Prompt: Tailor resume for the job, emphasize relevant skills, rewrite summary, adjust experience descriptions
- Saves as new Resume in DB

### Email Generation
- Same OpenAI call generates cover letter email body
- Prompt: Write concise professional application email (<200 words) based on candidate profile + job
- User edits before sending

## PDF Generation

Client-side using `html2canvas` + `jspdf`:
- Preview modal renders the tailored resume using existing ResumePreview component
- On confirm, capture the rendered resume as canvas -> convert to PDF blob
- Upload PDF with the send request

## Email Sending

- Gmail: `googleapis` npm package -> `gmail.users.messages.send()` with MIME attachment
- Outlook: `@microsoft/microsoft-graph-client` -> `/me/sendMail` with attachment
- Auto-refresh expired tokens using stored refresh token

## Dependencies

### Client (new)
- `react-tinder-card` - swipe gestures
- `html2canvas` - resume capture for PDF

### Server (new)
- `googleapis` - Gmail API
- `@azure/msal-node` - Microsoft OAuth
- `@microsoft/microsoft-graph-client` - Outlook email

### Third-Party Services
- JSearch API (RapidAPI) - job listings (free tier: 200 req/month)
- Google Cloud Console - OAuth credentials, Gmail API enabled
- Microsoft Azure App Registration - OAuth credentials, Mail.Send permission

### Environment Variables
```
RAPIDAPI_KEY=
RAPIDAPI_HOST=jsearch.p.rapidapi.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=
```

## Key Decisions
- Job feed is personalized based on user's existing resume data (skills, experience, profession)
- No match score for now - just relevant job suggestions
- Left-swiped jobs are dismissed (not shown again), no history
- Right-swiped jobs tracked in "Applied" tracker with email status
- User always previews and can edit before sending (no auto-send)
- Client-side PDF generation to avoid heavy server dependencies
