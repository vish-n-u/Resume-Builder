import React, { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import { ArrowLeftIcon, Award, Briefcase, ChevronLeft, ChevronRight, CopyIcon, DatabaseIcon, DownloadIcon, EyeIcon, EyeOffIcon, FileText, FolderIcon, GraduationCap, Share2Icon, Sparkles, Trophy, User, Plus, AlertCircle, CheckCircle, XIcon, Menu, X } from 'lucide-react'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm'
import ExperienceForm from '../components/ExperienceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillsForm from '../components/SkillsForm'
import CertificationsForm from '../components/CertificationsForm'
import AchievementsForm from '../components/AchievementsForm'
import CustomSectionsForm from '../components/CustomSectionsForm'
import CustomPromptModal from '../components/CustomPromptModal'
import JobRequirementsModal from '../components/JobRequirementsModal'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import SEO from '../components/SEO'

const ResumeBuilder = () => {

  const { resumeId } = useParams()
  const {token} = useSelector(state => state.auth)

  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    job_description: '',
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    certifications: [],
    achievements: [],
    custom_sections: [],
    template: "classic",
    accent_color: "#000000",
    public: false,
    sectionVisibility: {
      summary: true,
      experience: true,
      education: true,
      projects: true,
      skills: true,
      certifications: true,
      achievements: true,
      customSections: true,
    }
  })

  const loadExistingResume = async () => {
   try {
    const {data} = await api.get('/api/resumes/get/' + resumeId, {headers: { Authorization: token }})
    if(data.resume){
      // Ensure sectionVisibility exists with default values
      const loadedResume = {
        ...data.resume,
        custom_sections: data.resume.custom_sections || [],
        sectionVisibility: data.resume.sectionVisibility || {
          summary: true,
          experience: true,
          education: true,
          projects: true,
          skills: true,
          certifications: true,
          achievements: true,
          customSections: true,
        }
      }
      setResumeData(loadedResume)
      document.title = data.resume.title;
    }
   } catch (error) {
    console.log(error.message)
   }
  }

  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [showProfileData, setShowProfileData] = useState(false)
  const [defaultResumeData, setDefaultResumeData] = useState(null)
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('') // '', 'saving', 'saved'
  const [showMissingModal, setShowMissingModal] = useState(false)
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Refs for auto-save functionality
  const isInitialLoad = useRef(true)
  const saveTimeoutRef = useRef(null)

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
    { id: "certifications", name: "Certifications", icon: Award },
    { id: "achievements", name: "Achievements", icon: Trophy },
    { id: "customSections", name: "Custom Sections", icon: Plus },
  ]

  const activeSection = sections[activeSectionIndex]

  const toggleSectionVisibility = (sectionId) => {
    setResumeData(prev => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [sectionId]: !prev.sectionVisibility?.[sectionId]
      }
    }))
  }

  const loadDefaultResumeData = async () => {
    try {
      const { data } = await api.get('/api/users/default-resume-data', {headers: { Authorization: token }})
      if (data.defaultResumeData && Object.keys(data.defaultResumeData).length > 0) {
        setDefaultResumeData(data.defaultResumeData)
      }
    } catch (error) {
      console.error('Error loading default resume data:', error)
    }
  }

  useEffect(()=>{
    loadExistingResume()
    loadDefaultResumeData()
  },[])

  // Auto-save effect - saves resume data after 3 seconds of inactivity
  useEffect(() => {
    // Skip auto-save on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    // Skip if resumeData doesn't have an ID yet (not loaded)
    if (!resumeData._id) {
      return
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save (3 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      autoSaveResume()
    }, 3000)

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [resumeData]) // Trigger on any resumeData change

  const changeResumeVisibility = async () => {
    try {
       const formData = new FormData()
       formData.append("resumeId", resumeId)
       formData.append("resumeData", JSON.stringify({public: !resumeData.public}))

       const {data} = await api.put('/api/resumes/update', formData, {headers: { Authorization: token }})

       setResumeData({...resumeData, public: !resumeData.public})
       toast.success(data.message)
    } catch (error) {
      console.error("Error saving resume:", error)
    }
  }

  const handleShare = () =>{
    const frontendUrl = window.location.href.split('/app/')[0];
    const resumeUrl = frontendUrl + '/view/' + resumeId;

    if(navigator.share){
      navigator.share({url: resumeUrl, text: "My Resume", })
    }else{
      alert('Share not supported on this browser.')
    }
  }

  const downloadResume = () => {
    window.print();
  }


const saveResume = async () => {
  try {
    let updatedResumeData = structuredClone(resumeData)

    // remove image from updatedResumeData
    if(typeof resumeData.personal_info.image === 'object'){
      delete updatedResumeData.personal_info.image
    }

    const formData = new FormData();
    formData.append("resumeId", resumeId)
    formData.append('resumeData', JSON.stringify(updatedResumeData))
    removeBackground && formData.append("removeBackground", "yes");
    typeof resumeData.personal_info.image === 'object' && formData.append("image", resumeData.personal_info.image)

    const { data } = await api.put('/api/resumes/update', formData, {headers: { Authorization: token }})

    setResumeData(data.resume)
    toast.success(data.message)
  } catch (error) {
    console.error("Error saving resume:", error)
  }
}

// Auto-save function (silent, without toast notifications)
const autoSaveResume = async () => {
  try {
    setAutoSaveStatus('saving')

    let updatedResumeData = structuredClone(resumeData)

    // remove image from updatedResumeData
    if(typeof resumeData.personal_info.image === 'object'){
      delete updatedResumeData.personal_info.image
    }

    const formData = new FormData();
    formData.append("resumeId", resumeId)
    formData.append('resumeData', JSON.stringify(updatedResumeData))
    removeBackground && formData.append("removeBackground", "yes");
    typeof resumeData.personal_info.image === 'object' && formData.append("image", resumeData.personal_info.image)

    await api.put('/api/resumes/update', formData, {headers: { Authorization: token }})

    setAutoSaveStatus('saved')

    // Clear the "saved" status after 2 seconds
    setTimeout(() => setAutoSaveStatus(''), 2000)
  } catch (error) {
    console.error("Error auto-saving resume:", error)
    setAutoSaveStatus('')
  }
}

  return (
    <>
      <SEO
        title="Resume Builder - Flower Resume | Create Your Professional Resume"
        description="Build and customize your professional resume with AI assistance. Choose templates, add sections, and export to PDF."
        keywords="build resume, resume editor, professional resume builder, customize resume, resume templates"
        ogUrl="https://flowerresume.com/app/builder"
      />
      <style>
        {`
          @media (max-width: 1024px) {
            body {
              overflow-x: hidden;
              max-width: 100vw;
            }
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4">
        <Link to={'/app'} className='inline-flex gap-1.5 items-center text-slate-500 hover:text-slate-700 transition-all text-xs sm:text-sm font-medium'>
          <ArrowLeftIcon className="size-3.5 sm:size-4"/> <span className='hidden sm:inline'>Back to Dashboard</span><span className='sm:hidden'>Back</span>
        </Link>
      </div>

      <div className='max-w-7xl mx-auto px-4 pb-4 hidden lg:block'>
        <div className='flex flex-col sm:flex-row gap-3'>
          <button
            onClick={() => setShowCustomPrompt(true)}
            className='flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-sm font-semibold shadow-lg'
            title="Use AI to generate custom content"
          >
            <Sparkles className="size-5"/>
            <span>AI Prompt</span>
          </button>

          <button
            onClick={() => setIsRequirementsModalOpen(true)}
            className='flex items-center justify-center gap-2 px-5 py-3 text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold'
          >
            <Briefcase className='size-5'/>
            <span>What This Job Needs</span>
          </button>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-3 sm:px-4 pb-6 lg:pb-8 overflow-hidden'>
        {/* Mobile Edit Button - Fixed at bottom right on mobile */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className='lg:hidden fixed bottom-5 right-4 z-30 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full p-3.5 shadow-xl hover:shadow-purple-500/50 transition-all active:scale-95'
        >
          <Menu className='size-5' />
        </button>

        <div className='grid lg:grid-cols-12 gap-8 w-full'>
          {/* Left Panel - Form (Hidden on mobile, shown in drawer) */}
          <div className='relative lg:col-span-5 rounded-lg overflow-hidden hidden lg:block'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              {/* progress bar using activeSectionIndex */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200"/>
              <hr className="absolute top-0 left-0  h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000" style={{width: `${activeSectionIndex * 100 / (sections.length - 1)}%`}}/>

              {/* Section Navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-300 py-1 gap-3">

                <div className='flex items-center gap-2'>
                  <TemplateSelector selectedTemplate={resumeData.template} onChange={(template)=> setResumeData(prev => ({...prev, template}))}/>
                  <ColorPicker selectedColor={resumeData.accent_color} onChange={(color)=>setResumeData(prev => ({...prev, accent_color: color}))}/>
                </div>

                <div className='flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start'>
                  {activeSectionIndex !== 0 && (
                    <button onClick={()=> setActiveSectionIndex((prevIndex)=> Math.max(prevIndex - 1, 0))} className='flex items-center gap-1 px-3 py-2 sm:p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all' disabled={activeSectionIndex === 0}>
                      <ChevronLeft className="size-4"/> <span className="sm:inline">Previous</span>
                    </button>
                  )}
                  <button onClick={()=> setActiveSectionIndex((prevIndex)=> Math.min(prevIndex + 1, sections.length - 1))} className={`flex items-center gap-1 px-3 py-2 sm:p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && 'opacity-50'}`} disabled={activeSectionIndex === sections.length - 1}>
                      <span className="sm:inline">Next</span> <ChevronRight className="size-4"/>
                    </button>
                </div>
              </div>

              {/* Form Content */}
              <div className='space-y-6'>
                  {activeSection.id === 'personal' && (
                    <PersonalInfoForm data={resumeData.personal_info} onChange={(data)=>setResumeData(prev => ({...prev, personal_info: data }))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />
                  )}
                  {activeSection.id === 'summary' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Professional Summary</h3>
                        <button
                          onClick={() => toggleSectionVisibility('summary')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility?.summary ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility?.summary ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility?.summary ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(data)=> setResumeData(prev=> ({...prev, professional_summary: data}))} setResumeData={setResumeData}/>
                    </div>
                  )}
                  {activeSection.id === 'experience' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Experience</h3>
                        <button
                          onClick={() => toggleSectionVisibility('experience')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility?.experience ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility?.experience ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility?.experience ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <ExperienceForm data={resumeData.experience} onChange={(data)=> setResumeData(prev=> ({...prev, experience: data}))} jobDescription={resumeData.job_description}/>
                    </div>
                  )}
                  {activeSection.id === 'education' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Education</h3>
                        <button
                          onClick={() => toggleSectionVisibility('education')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility?.education ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility?.education ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility?.education ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <EducationForm data={resumeData.education} onChange={(data)=> setResumeData(prev=> ({...prev, education: data}))}/>
                    </div>
                  )}
                  {activeSection.id === 'projects' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Projects</h3>
                        <button
                          onClick={() => toggleSectionVisibility('projects')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility?.projects ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility?.projects ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility?.projects ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <ProjectForm data={resumeData.project} onChange={(data)=> setResumeData(prev=> ({...prev, project: data}))}/>
                    </div>
                  )}
                  {activeSection.id === 'skills' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Skills</h3>
                        <button
                          onClick={() => toggleSectionVisibility('skills')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility?.skills ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility?.skills ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility?.skills ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <SkillsForm data={resumeData.skills} onChange={(data)=> setResumeData(prev=> ({...prev, skills: data}))}/>
                    </div>
                  )}
                  {activeSection.id === 'certifications' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Certifications</h3>
                        <button
                          onClick={() => toggleSectionVisibility('certifications')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility?.certifications ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility?.certifications ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility?.certifications ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <CertificationsForm data={resumeData.certifications} onChange={(data)=> setResumeData(prev=> ({...prev, certifications: data}))}/>
                    </div>
                  )}
                  {activeSection.id === 'achievements' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Achievements</h3>
                        <button
                          onClick={() => toggleSectionVisibility('achievements')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility?.achievements ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility?.achievements ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility?.achievements ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <AchievementsForm data={resumeData.achievements} onChange={(data)=> setResumeData(prev=> ({...prev, achievements: data}))}/>
                    </div>
                  )}
                  {activeSection.id === 'customSections' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Custom Sections</h3>
                        <button
                          onClick={() => toggleSectionVisibility('customSections')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility?.customSections ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility?.customSections ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility?.customSections ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <CustomSectionsForm data={resumeData.custom_sections} onChange={(data)=> setResumeData(prev=> ({...prev, custom_sections: data}))}/>
                    </div>
                  )}

              </div>
            </div>
          </div>

          {/* Right Panel - Preview / Profile Data */}
          <div className='lg:col-span-7 w-full overflow-hidden'>
              {/* Action Buttons at top */}
              <div className='w-full mb-3'>
                <div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between max-w-full'>

                  {/* Show Profile Data Toggle */}
                  <button
                    onClick={() => setShowProfileData(!showProfileData)}
                    className={`flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm rounded-lg transition-all font-medium shadow-md lg:shadow-lg ${
                      showProfileData
                        ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white'
                        : 'bg-white text-yellow-700 border border-yellow-300 lg:border-2 hover:bg-yellow-50'
                    }`}
                  >
                    <DatabaseIcon className='size-3.5 lg:size-4'/>
                    <span className='whitespace-nowrap'>{showProfileData ? 'Show Resume' : 'Profile Data'}</span>
                  </button>

                  {/* Right side actions */}
                  <div className='flex items-center gap-2 flex-wrap'>
                    {resumeData.public && (
                      <button
                        onClick={handleShare}
                        className='flex items-center justify-center px-3 lg:px-4 py-2 lg:py-2.5 gap-1.5 lg:gap-2 text-xs lg:text-sm bg-white text-blue-600 rounded-lg border border-blue-200 lg:border-2 hover:bg-blue-50 transition-all font-medium shadow-md lg:shadow-lg flex-1 lg:flex-initial'
                      >
                        <Share2Icon className='size-3.5 lg:size-4'/>
                        <span className='whitespace-nowrap'>Share</span>
                      </button>
                    )}

                    <button
                      onClick={()=> {toast.promise(saveResume, {loading: 'Saving...'})}}
                      className='flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md lg:shadow-lg hover:from-green-600 hover:to-green-700 transition-all font-medium flex-1 lg:flex-initial'
                    >
                      <CheckCircle className='size-3.5 lg:size-4'/>
                      <span className='whitespace-nowrap'>Save</span>
                    </button>

                    <button
                      onClick={downloadResume}
                      className='flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-lg shadow-md lg:shadow-lg hover:from-gray-800 hover:to-gray-900 transition-all font-medium flex-1 lg:flex-initial'
                    >
                      <DownloadIcon className='size-3.5 lg:size-4'/>
                      <span className='whitespace-nowrap'>Download</span>
                    </button>

                    {autoSaveStatus && (
                      <span className={`text-[10px] lg:text-xs px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg font-medium shadow-md lg:shadow-lg ${autoSaveStatus === 'saving' ? 'text-gray-700 bg-white border border-gray-200 lg:border-2' : 'text-green-700 bg-white border border-green-200 lg:border-2'}`}>
                        {autoSaveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggle between Resume Preview and Profile Data */}
              {!showProfileData ? (
                <div className='w-full overflow-x-hidden'>
                  <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color}/>
                </div>
              ) : (
                <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6 w-full overflow-x-hidden break-words'>
                  <div className='mb-6'>
                    <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
                      <DatabaseIcon className='size-7 text-yellow-600'/>
                      My Profile Data
                    </h2>
                    <p className='text-gray-600 text-sm mt-2'>Reference and copy content from your stored profile to use in your resume</p>
                  </div>

                  {!defaultResumeData ? (
                    <div className='text-center py-12'>
                      <DatabaseIcon className='size-16 mx-auto text-gray-300 mb-4'/>
                      <p className='text-gray-500 text-lg'>No profile data found</p>
                      <Link to='/app/profile' className='text-yellow-600 hover:underline mt-2 inline-block'>
                        Go to Profile to add your data
                      </Link>
                    </div>
                  ) : (
                    <div className='space-y-6'>
                      {/* Professional Summary */}
                      {defaultResumeData.professional_summary && (
                        <DataSection
                          title="Professional Summary"
                          icon={FileText}
                          content={defaultResumeData.professional_summary}
                        />
                      )}

                      {/* Skills */}
                      {defaultResumeData.skills && defaultResumeData.skills.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-3'>
                            <Sparkles className='size-5 text-yellow-600'/>
                            Skills
                          </h3>
                          <div className='flex flex-wrap gap-2'>
                            {defaultResumeData.skills.map((skill, index) => (
                              <CopyableChip key={index} text={skill} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {defaultResumeData.experience && defaultResumeData.experience.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <Briefcase className='size-5 text-yellow-600'/>
                            Experience
                          </h3>
                          <div className='space-y-4'>
                            {defaultResumeData.experience.map((exp, index) => (
                              <ExperienceCard key={index} experience={exp} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {defaultResumeData.education && defaultResumeData.education.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <GraduationCap className='size-5 text-yellow-600'/>
                            Education
                          </h3>
                          <div className='space-y-4'>
                            {defaultResumeData.education.map((edu, index) => (
                              <EducationCard key={index} education={edu} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {defaultResumeData.project && defaultResumeData.project.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <FolderIcon className='size-5 text-yellow-600'/>
                            Projects
                          </h3>
                          <div className='space-y-4'>
                            {defaultResumeData.project.map((proj, index) => (
                              <ProjectCard key={index} project={proj} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {defaultResumeData.certifications && defaultResumeData.certifications.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <Award className='size-5 text-yellow-600'/>
                            Certifications
                          </h3>
                          <div className='space-y-3'>
                            {defaultResumeData.certifications.map((cert, index) => (
                              <CertificationCard key={index} certification={cert} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Achievements */}
                      {defaultResumeData.achievements && defaultResumeData.achievements.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <Trophy className='size-5 text-yellow-600'/>
                            Achievements
                          </h3>
                          <div className='space-y-3'>
                            {defaultResumeData.achievements.map((ach, index) => (
                              <AchievementCard key={index} achievement={ach} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Custom Prompt Modal */}
      <CustomPromptModal
        isOpen={showCustomPrompt}
        onClose={() => setShowCustomPrompt(false)}
        resumeData={resumeData}
        setResumeData={setResumeData}
      />

      {/* Job Requirements Modal */}
      <JobRequirementsModal
        isOpen={isRequirementsModalOpen}
        onClose={() => setIsRequirementsModalOpen(false)}
        jobDescription={resumeData.job_description}
      />

      {/* Mobile Drawer for Editing */}
      {isMobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/60 z-40 lg:hidden'
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer - slides from bottom on mobile */}
          <div className='fixed inset-x-0 bottom-0 bg-white z-50 lg:hidden overflow-hidden flex flex-col rounded-t-2xl shadow-2xl' style={{height: '92vh', maxHeight: '92vh'}}>
            {/* Drawer Header */}
            <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0'>
              <h2 className='text-base font-semibold text-gray-900'>Edit Resume</h2>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='size-5' />
              </button>
            </div>

            {/* Drawer Content - Form Panel */}
            <div className='flex-1 overflow-y-auto overflow-x-hidden overscroll-contain'>
              <div className='p-3 pb-6 max-w-full'>
                {/* AI Features Buttons */}
                <div className='grid grid-cols-2 gap-2 mb-3'>
                  <button
                    onClick={() => {setShowCustomPrompt(true); setIsMobileDrawerOpen(false)}}
                    className='flex items-center justify-center gap-1.5 px-2 py-2.5 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-xs font-semibold shadow-md'
                  >
                    <Sparkles className="size-3.5"/>
                    <span>AI Prompt</span>
                  </button>

                  <button
                    onClick={() => {setIsRequirementsModalOpen(true); setIsMobileDrawerOpen(false)}}
                    className='flex items-center justify-center gap-1.5 px-2 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all font-semibold text-xs'
                  >
                    <Briefcase className='size-3.5'/>
                    <span>Job Needs</span>
                  </button>
                </div>

                <div className='bg-gray-50 rounded-lg border border-gray-200 p-3 w-full overflow-hidden'>
                  {/* progress bar using activeSectionIndex */}
                  <div className='relative mb-3 w-full'>
                    <hr className="border border-gray-300"/>
                    <hr className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000" style={{width: `${activeSectionIndex * 100 / (sections.length - 1)}%`}}/>
                  </div>

                  {/* Section Navigation */}
                  <div className="flex flex-col justify-between items-start mb-3 border-b border-gray-300 pb-3 gap-2 w-full">
                    {/* Current Section Display */}
                    <div className='w-full'>
                      <p className='text-[10px] text-gray-500 mb-0.5'>Editing Section</p>
                      <p className='text-base font-semibold text-gray-900'>{activeSection.name}</p>
                    </div>

                    <div className='flex items-center gap-2 w-full'>
                      <TemplateSelector selectedTemplate={resumeData.template} onChange={(template)=> setResumeData(prev => ({...prev, template}))}/>
                      <ColorPicker selectedColor={resumeData.accent_color} onChange={(color)=>setResumeData(prev => ({...prev, accent_color: color}))}/>
                    </div>

                    <div className='flex items-center gap-2 w-full justify-between'>
                      <button
                        onClick={()=> setActiveSectionIndex((prevIndex)=> Math.max(prevIndex - 1, 0))}
                        className='flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1'
                        disabled={activeSectionIndex === 0}
                      >
                        <ChevronLeft className="size-3.5"/> <span>Prev</span>
                      </button>
                      <button
                        onClick={()=> setActiveSectionIndex((prevIndex)=> Math.min(prevIndex + 1, sections.length - 1))}
                        className='flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1'
                        disabled={activeSectionIndex === sections.length - 1}
                      >
                        <span>Next</span> <ChevronRight className="size-3.5"/>
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className='space-y-4 w-full overflow-hidden'>
                    {activeSection.id === 'personal' && (
                      <PersonalInfoForm data={resumeData.personal_info} onChange={(data)=>setResumeData(prev => ({...prev, personal_info: data }))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />
                    )}
                    {activeSection.id === 'summary' && (
                      <div>
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='text-sm font-semibold text-gray-900'>Professional Summary</h3>
                          <button
                            onClick={() => toggleSectionVisibility('summary')}
                            className={`p-1.5 rounded-lg transition-colors ${resumeData.sectionVisibility?.summary ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            title={resumeData.sectionVisibility?.summary ? 'Hide in preview' : 'Show in preview'}
                          >
                            {resumeData.sectionVisibility?.summary ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                          </button>
                        </div>
                        <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(data)=> setResumeData(prev=> ({...prev, professional_summary: data}))} setResumeData={setResumeData}/>
                      </div>
                    )}
                    {activeSection.id === 'experience' && (
                      <div>
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='text-sm font-semibold text-gray-900'>Experience</h3>
                          <button
                            onClick={() => toggleSectionVisibility('experience')}
                            className={`p-1.5 rounded-lg transition-colors ${resumeData.sectionVisibility?.experience ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            title={resumeData.sectionVisibility?.experience ? 'Hide in preview' : 'Show in preview'}
                          >
                            {resumeData.sectionVisibility?.experience ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                          </button>
                        </div>
                        <ExperienceForm data={resumeData.experience} onChange={(data)=> setResumeData(prev=> ({...prev, experience: data}))} jobDescription={resumeData.job_description}/>
                      </div>
                    )}
                    {activeSection.id === 'education' && (
                      <div>
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='text-sm font-semibold text-gray-900'>Education</h3>
                          <button
                            onClick={() => toggleSectionVisibility('education')}
                            className={`p-1.5 rounded-lg transition-colors ${resumeData.sectionVisibility?.education ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            title={resumeData.sectionVisibility?.education ? 'Hide in preview' : 'Show in preview'}
                          >
                            {resumeData.sectionVisibility?.education ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                          </button>
                        </div>
                        <EducationForm data={resumeData.education} onChange={(data)=> setResumeData(prev=> ({...prev, education: data}))}/>
                      </div>
                    )}
                    {activeSection.id === 'projects' && (
                      <div>
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='text-sm font-semibold text-gray-900'>Projects</h3>
                          <button
                            onClick={() => toggleSectionVisibility('projects')}
                            className={`p-1.5 rounded-lg transition-colors ${resumeData.sectionVisibility?.projects ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            title={resumeData.sectionVisibility?.projects ? 'Hide in preview' : 'Show in preview'}
                          >
                            {resumeData.sectionVisibility?.projects ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                          </button>
                        </div>
                        <ProjectForm data={resumeData.project} onChange={(data)=> setResumeData(prev=> ({...prev, project: data}))}/>
                      </div>
                    )}
                    {activeSection.id === 'skills' && (
                      <div>
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='text-sm font-semibold text-gray-900'>Skills</h3>
                          <button
                            onClick={() => toggleSectionVisibility('skills')}
                            className={`p-1.5 rounded-lg transition-colors ${resumeData.sectionVisibility?.skills ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            title={resumeData.sectionVisibility?.skills ? 'Hide in preview' : 'Show in preview'}
                          >
                            {resumeData.sectionVisibility?.skills ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                          </button>
                        </div>
                        <SkillsForm data={resumeData.skills} onChange={(data)=> setResumeData(prev=> ({...prev, skills: data}))}/>
                      </div>
                    )}
                    {activeSection.id === 'certifications' && (
                      <div>
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='text-sm font-semibold text-gray-900'>Certifications</h3>
                          <button
                            onClick={() => toggleSectionVisibility('certifications')}
                            className={`p-1.5 rounded-lg transition-colors ${resumeData.sectionVisibility?.certifications ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            title={resumeData.sectionVisibility?.certifications ? 'Hide in preview' : 'Show in preview'}
                          >
                            {resumeData.sectionVisibility?.certifications ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                          </button>
                        </div>
                        <CertificationsForm data={resumeData.certifications} onChange={(data)=> setResumeData(prev=> ({...prev, certifications: data}))}/>
                      </div>
                    )}
                    {activeSection.id === 'achievements' && (
                      <div>
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='text-sm font-semibold text-gray-900'>Achievements</h3>
                          <button
                            onClick={() => toggleSectionVisibility('achievements')}
                            className={`p-1.5 rounded-lg transition-colors ${resumeData.sectionVisibility?.achievements ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            title={resumeData.sectionVisibility?.achievements ? 'Hide in preview' : 'Show in preview'}
                          >
                            {resumeData.sectionVisibility?.achievements ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                          </button>
                        </div>
                        <AchievementsForm data={resumeData.achievements} onChange={(data)=> setResumeData(prev=> ({...prev, achievements: data}))}/>
                      </div>
                    )}
                    {activeSection.id === 'customSections' && (
                      <div>
                        <div className='flex items-center justify-between mb-3'>
                          <h3 className='text-sm font-semibold text-gray-900'>Custom Sections</h3>
                          <button
                            onClick={() => toggleSectionVisibility('customSections')}
                            className={`p-1.5 rounded-lg transition-colors ${resumeData.sectionVisibility?.customSections ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            title={resumeData.sectionVisibility?.customSections ? 'Hide in preview' : 'Show in preview'}
                          >
                            {resumeData.sectionVisibility?.customSections ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                          </button>
                        </div>
                        <CustomSectionsForm data={resumeData.custom_sections} onChange={(data)=> setResumeData(prev=> ({...prev, custom_sections: data}))}/>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </>
  )
}

// Helper Components for Drawer
const DataSection = ({ title, icon: Icon, content }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
          <Icon className='size-5 text-yellow-600'/>
          {title}
        </h3>
        <button
          onClick={handleCopy}
          className='flex items-center gap-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md text-xs transition-colors'
        >
          <CopyIcon className='size-3'/>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className='text-gray-700 text-sm leading-relaxed' dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

const CopyableChip = ({ text }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className='px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full text-sm transition-colors flex items-center gap-1'
    >
      {text}
      {copied && <CopyIcon className='size-3'/>}
    </button>
  )
}

const ExperienceCard = ({ experience }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(experience.description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Description copied!')
  }

  return (
    <div className='bg-white p-4 rounded-lg border border-gray-200'>
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-semibold text-gray-800'>{experience.position}</h4>
          <p className='text-sm text-gray-600'>{experience.company}</p>
          <p className='text-xs text-gray-500 mt-1'>
            {experience.start_date} - {experience.is_current ? 'Present' : experience.end_date}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className='flex items-center gap-1 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-xs transition-colors'
        >
          <CopyIcon className='size-3'/>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className='text-sm text-gray-700 mt-2' dangerouslySetInnerHTML={{ __html: experience.description }} />
    </div>
  )
}

const EducationCard = ({ education }) => {
  return (
    <div className='bg-white p-4 rounded-lg border border-gray-200'>
      <h4 className='font-semibold text-gray-800'>{education.degree} {education.field && `in ${education.field}`}</h4>
      <p className='text-sm text-gray-600'>{education.institution}</p>
      <div className='flex gap-4 mt-1'>
        {education.graduation_date && <p className='text-xs text-gray-500'>{education.graduation_date}</p>}
        {education.gpa && <p className='text-xs text-gray-500'>GPA: {education.gpa}</p>}
      </div>
    </div>
  )
}

const ProjectCard = ({ project }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(project.description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Description copied!')
  }

  return (
    <div className='bg-white p-4 rounded-lg border border-gray-200'>
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-semibold text-gray-800'>{project.name}</h4>
          {project.type && <p className='text-sm text-gray-600'>{project.type}</p>}
        </div>
        <button
          onClick={handleCopy}
          className='flex items-center gap-1 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-xs transition-colors'
        >
          <CopyIcon className='size-3'/>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className='text-sm text-gray-700 mt-2' dangerouslySetInnerHTML={{ __html: project.description }} />
    </div>
  )
}

const CertificationCard = ({ certification }) => {
  return (
    <div className='bg-white p-3 rounded-lg border border-gray-200'>
      <h4 className='font-semibold text-gray-800 text-sm'>{certification.name}</h4>
      <p className='text-sm text-gray-600'>{certification.issuer}</p>
      <div className='flex gap-4 mt-1'>
        {certification.date && <p className='text-xs text-gray-500'>{certification.date}</p>}
        {certification.credential_id && <p className='text-xs text-gray-500'>ID: {certification.credential_id}</p>}
      </div>
    </div>
  )
}

const AchievementCard = ({ achievement }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(achievement.description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Description copied!')
  }

  return (
    <div className='bg-white p-3 rounded-lg border border-gray-200'>
      <div className='flex justify-between items-start'>
        <h4 className='font-semibold text-gray-800 text-sm'>{achievement.title}</h4>
        <button
          onClick={handleCopy}
          className='flex items-center gap-1 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-xs transition-colors'
        >
          <CopyIcon className='size-3'/>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className='text-sm text-gray-700 mt-1' dangerouslySetInnerHTML={{ __html: achievement.description }} />
    </div>
  )
}

export default ResumeBuilder
