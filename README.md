# Resume Builder - AI-Powered Professional Resume Creator

A modern, full-stack web application for creating professional resumes with AI-powered enhancements. Build stunning resumes with multiple templates, customize with AI assistance, and export to PDF.

![Resume Builder](https://img.shields.io/badge/Build-Passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-v18+-green)
![React](https://img.shields.io/badge/React-19.0-blue)

## Features

### Core Features
- **AI-Powered Resume Tailoring** - Create job-specific resumes based on job descriptions
- **AI Content Enhancement** - Improve professional summaries and job descriptions
- **AI Suggestions** - Get intelligent content suggestions based on job postings
- **Multiple Templates** - 4 professional templates (Classic, Modern, Minimal, Minimal-Image)
- **PDF Export** - Download resumes as high-quality PDFs
- **Rich Text Editor** - Format content with Quill-based text editor
- **Real-time Preview** - Live preview as you edit
- **Color Customization** - Choose from 10 accent colors

### Advanced Features
- **Default Resume Data** - Store master resume data for quick resume creation
- **Public/Private Sharing** - Share resumes with unique URLs
- **Section Visibility Control** - Show/hide sections as needed
- **Resume Upload** - Extract data from existing PDF resumes
- **Custom Sections** - Add your own custom sections
- **Certifications & Achievements** - Dedicated sections for credentials
- **SEO Optimization** - Meta tags for public resumes
- **Image Upload** - Profile photos with background removal (ImageKit)

## Tech Stack

### Frontend
- **React 19** - UI library
- **Redux Toolkit** - State management
- **React Router DOM 7** - Client-side routing
- **TailwindCSS 4** - Styling
- **Axios** - HTTP client
- **Quill** - Rich text editor
- **React Helmet Async** - SEO meta tags
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose 8** - ODM
- **OpenAI API** - AI integration
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **ImageKit** - Image storage & processing
- **Multer** - File uploads

## Prerequisites

- Node.js v18 or higher
- MongoDB database
- OpenAI API key
- ImageKit account (for image uploads)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd resume-builder
```

### 2. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 3. Environment Variables

#### Backend `.env` (server folder)
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

#### Frontend `.env` (client folder)
Create a `.env` file in the `client` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### 4. Database Setup

The application uses MongoDB. Make sure you have:
- A MongoDB instance running (local or cloud like MongoDB Atlas)
- Connection string in your backend `.env` file

Collections will be created automatically:
- `users` - User accounts
- `resumes` - Resume documents
- `detailedresumes` - Default resume data

## Running the Application

### Development Mode

#### Start Backend Server
```bash
cd server
npm run dev
```
Server runs on `http://localhost:3000`

#### Start Frontend Development Server
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

### Production Mode

#### Build Frontend
```bash
cd client
npm run build
```

#### Start Backend (Production)
```bash
cd server
npm start
```

## Usage Guide

### Creating Your First Resume

1. **Register/Login** - Create an account or sign in
2. **Dashboard** - Click "Create New Resume"
3. **Builder** - Fill in your information section by section:
   - Personal Information
   - Professional Summary
   - Work Experience
   - Education
   - Projects
   - Skills
   - Certifications (optional)
   - Achievements (optional)
   - Custom Sections (optional)
4. **Customize** - Choose a template and accent color
5. **Preview** - View real-time preview on the right
6. **Download** - Click "Download" to export as PDF

### Using AI Features

#### AI-Powered Resume Tailoring
1. Go to your **Profile** page
2. Upload your complete resume or fill in your default data
3. Create a new resume from Dashboard
4. Click **"Tailor Resume"** button
5. Paste the job description
6. AI will create a customized resume targeting that specific job

#### AI Content Enhancement
1. Write your content in any text field
2. Click the **AI enhance** button (sparkles icon)
3. Review the AI-improved content
4. Accept or modify as needed

#### AI Suggestions
1. While editing experience descriptions
2. Click **"Get Suggestions"**
3. Paste the job posting
4. Get 5 contextual bullet point suggestions
5. Select and use the ones you like

### Managing Default Resume Data

**Default Resume Data** acts as your master resume:
- Store your complete professional history once
- Use it to quickly create multiple tailored resumes
- AI uses this data for tailoring and suggestions
- Upload a PDF to auto-populate your profile

### Template Guide

- **Classic** - Traditional format, clean and professional
- **Modern** - Contemporary design with colored header
- **Minimal** - Minimalist approach, text-focused
- **Minimal-Image** - Two-column layout with profile photo

### Sharing Resumes

1. Toggle resume to **Public** (if feature enabled)
2. Click **Share** button
3. Copy the unique URL
4. Share with recruiters or on social media

## PDF Export

The application uses browser's print functionality for PDF export:

1. Click **Download** button
2. In print dialog:
   - Set destination to "Save as PDF"
   - Disable "Headers and footers" for clean output
   - Use default paper size (Letter)
3. Save your PDF

**Print Settings:**
- First page: No margins (templates handle spacing)
- Subsequent pages: 0.75in top/bottom margins
- Content optimized for printing

## Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Protected Routes** - Middleware verification
- **Input Validation** - Server-side validation
- **CORS** - Cross-origin resource sharing configured
- **Environment Variables** - Sensitive data in .env files

## Performance Optimizations

- **Code Splitting** - React lazy loading
- **Vite Build** - Fast development and optimized builds
- **MongoDB Indexing** - Optimized queries
- **Image Optimization** - ImageKit CDN and processing
- **Caching** - Browser caching for static assets

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED
```
Solution: Check MongoDB is running and connection string is correct

**OpenAI API Error**
```
Error: Invalid API key
```
Solution: Verify OPENAI_API_KEY in .env file

**Image Upload Fails**
```
Error: ImageKit configuration error
```
Solution: Check ImageKit credentials in .env file

**Port Already in Use**
```
Error: EADDRINUSE
```
Solution: Change PORT in .env or kill process using the port

### Getting Help

- Check [Application.md](./Application.md) for technical details
- Review error logs in browser console and terminal
- Ensure all environment variables are set correctly
- Verify API keys are valid and have proper permissions

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow existing code formatting
- Use meaningful variable names
- Comment complex logic
- Keep functions small and focused
- Write descriptive commit messages

## Roadmap

### Planned Features
- [ ] TypeScript migration
- [ ] Unit and integration tests
- [ ] Resume analytics (views, downloads)
- [ ] Version history for resumes
- [ ] Export to DOCX format
- [ ] ATS score checker
- [ ] Resume templates marketplace
- [ ] Collaboration features
- [ ] Mobile app
- [ ] Multi-language support

### Under Consideration
- Integration with LinkedIn
- Job application tracking
- Interview preparation tools
- Cover letter generator
- Skill assessments

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT API
- ImageKit for image processing
- MongoDB for database
- React team for the amazing library
- All open-source contributors

## Support

For support, email support@flowerresume.com or open an issue in the repository.

---

**Built with ❤️ by the Flower Resume Team**

Generated with [Claude Code](https://claude.com/claude-code)
