import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, Briefcase, CheckCircle, ChevronLeft, ChevronRight, DatabaseIcon, DownloadIcon, Edit3, EyeIcon, EyeOffIcon, FileText, ListOrdered, Palette, Share2Icon, Sparkles, X } from 'lucide-react'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import CustomPromptModal from '../components/CustomPromptModal'
import JobRequirementsModal from '../components/JobRequirementsModal'
import SectionEditor from '../components/builder/SectionEditor'
import ProfileDataPanel from '../components/builder/ProfileDataPanel'
import { BottomDrawer, ColorSheet, MobileActionMenu, SectionOrderSheet, TemplateSheet } from '../components/builder/MobileSheets'
import SectionTabs from '../components/builder/SectionTabs'
import JobMatchPanel from '../components/builder/JobMatchPanel'
import { SectionOrderButton } from '../components/builder/SectionOrderList'
import useResumeSave from '../components/builder/useResumeSave'
import { BUILDER_SECTIONS, DEFAULT_SECTION_VISIBILITY } from '../components/builder/sections'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import SEO from '../components/SEO'
import { usePostHog } from 'posthog-js/react'

const ResumeBuilder = ({ initialData = null, onClose = null }) => {

  const { resumeId: paramResumeId } = useParams()
  const resumeId = paramResumeId || initialData?._id || ''
  const {token} = useSelector(state => state.auth)
  const posthog = usePostHog()

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
    sectionVisibility: DEFAULT_SECTION_VISIBILITY
  })

  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [showProfileData, setShowProfileData] = useState(false)
  const [defaultResumeData, setDefaultResumeData] = useState(null)
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSectionOrder, setShowSectionOrder] = useState(false)
  const [isProfileDataDrawerOpen, setIsProfileDataDrawerOpen] = useState(false)

  const { autoSaveStatus, persistResume, saveNow, markSaved } = useResumeSave({ resumeId, token, resumeData, setResumeData })

  const activeSection = BUILDER_SECTIONS[activeSectionIndex]
  const isFirstSection = activeSectionIndex === 0
  const isLastSection = activeSectionIndex === BUILDER_SECTIONS.length - 1
  const goToPreviousSection = () => setActiveSectionIndex(index => Math.max(index - 1, 0))
  const goToNextSection = () => setActiveSectionIndex(index => Math.min(index + 1, BUILDER_SECTIONS.length - 1))
  const progressWidth = `${activeSectionIndex * 100 / (BUILDER_SECTIONS.length - 1)}%`

  // Fill in defaults for older resumes and mark the result as already saved
  const loadResume = (resume) => {
    const loadedResume = {
      ...resume,
      custom_sections: resume.custom_sections || [],
      sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY, ...resume.sectionVisibility }
    }
    markSaved(loadedResume)
    setResumeData(loadedResume)
  }

  const loadExistingResume = async () => {
   try {
    const {data} = await api.get('/api/resumes/get/' + resumeId, {headers: { Authorization: token }})
    if(data.resume){
      loadResume(data.resume)
      document.title = data.resume.title;
    }
   } catch (error) {
    toast.error(error?.response?.data?.message || 'Could not load this resume')
   }
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
    if (initialData) {
      loadResume(initialData)
    } else {
      loadExistingResume()
    }
    loadDefaultResumeData()
  },[])

  const togglePublic = async () => {
    const next = { ...resumeData, public: !resumeData.public }
    setResumeData(next)
    try {
      await persistResume(next)
      toast.success(next.public ? 'Resume is now public — anyone with the link can view it' : 'Resume is now private')
    } catch (error) {
      setResumeData(prev => ({ ...prev, public: !next.public }))
      toast.error(error?.response?.data?.message || 'Could not change visibility')
    }
  }

  const handleShare = async () =>{
    const frontendUrl = window.location.href.split('/app/')[0];
    const resumeUrl = frontendUrl + '/view/' + resumeId;

    if(navigator.share){
      navigator.share({url: resumeUrl, text: "My Resume", }).catch(() => {})
    }else{
      try {
        await navigator.clipboard.writeText(resumeUrl)
        toast.success('Link copied to clipboard')
      } catch {
        toast(resumeUrl)
      }
    }
  }

  const downloadResume = () => {
    posthog?.capture('resume_downloaded', { template: resumeData.template, resumeId })
    window.print();
  }

  const saveResume = () => {
    toast.promise(saveNow(), {
      loading: 'Saving...',
      success: 'Saved successfully',
      error: (error) => error?.response?.data?.message || 'Save failed. Please try again.'
    }).then(() => posthog?.capture('resume_saved', { template: resumeData.template, resumeId }), () => {})
  }

  const mobileActions = [
    { label: 'Edit Resume', icon: Edit3, iconClass: 'bg-purple-100 text-purple-600', onClick: () => setIsMobileDrawerOpen(true) },
    { label: 'AI Prompt', icon: Sparkles, iconClass: 'bg-purple-100 text-purple-600', onClick: () => setShowCustomPrompt(true) },
    { label: 'Job Needs', icon: Briefcase, iconClass: 'bg-blue-100 text-blue-600', onClick: () => setIsRequirementsModalOpen(true) },
    { label: 'Template', icon: FileText, iconClass: 'bg-green-100 text-green-600', onClick: () => setShowTemplateSelector(true) },
    { label: 'Colour', icon: Palette, iconClass: 'bg-pink-100 text-pink-600', onClick: () => setShowColorPicker(true) },
    { label: 'Section Order', icon: ListOrdered, iconClass: 'bg-emerald-100 text-emerald-600', onClick: () => setShowSectionOrder(true) },
    { label: 'Profile Data', icon: DatabaseIcon, iconClass: 'bg-yellow-100 text-yellow-600', onClick: () => setIsProfileDataDrawerOpen(true) },
  ]

  return (
    <>
      {!onClose && (
        <SEO
          title="Free AI Resume Builder - Paste Job Description & Create Tailored Resume | Flower Resume"
          description="Build your resume for free with AI. Paste any job description to auto-generate a tailored resume. Choose from professional templates and download as PDF — unlimited and free."
          keywords="free AI resume builder, paste job description create resume, free resume editor, tailored resume generator, JD to resume AI, free PDF resume maker, professional resume templates free, ATS-friendly resume builder"
          ogUrl="https://app.flower-resume.com/app/builder"
        />
      )}
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
      <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4 flex items-center justify-between">
        {onClose ? (
          <button
            onClick={() => onClose(resumeData)}
            className='inline-flex gap-1.5 items-center text-slate-500 hover:text-slate-700 transition-all text-xs sm:text-sm font-medium'
          >
            <ArrowLeftIcon className="size-3.5 sm:size-4"/> <span>Back to Application</span>
          </button>
        ) : (
          <Link to={'/app'} className='inline-flex gap-1.5 items-center text-slate-500 hover:text-slate-700 transition-all text-xs sm:text-sm font-medium'>
            <ArrowLeftIcon className="size-3.5 sm:size-4"/> <span className='hidden sm:inline'>Back to Dashboard</span><span className='sm:hidden'>Back</span>
          </Link>
        )}
        {onClose && (
          <button onClick={() => onClose(resumeData)} aria-label='Close' className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-500'>
            <X className='size-5' />
          </button>
        )}
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

      <div className='max-w-7xl  mx-auto px-3 sm:px-4 pb-6 lg:pb-8 overflow-hidden'>
        <MobileActionMenu isOpen={isFabMenuOpen} setIsOpen={setIsFabMenuOpen} actions={mobileActions} />

        <div className='grid lg:grid-cols-12 gap-8 w-full'>
          {/* Left Panel - Form (Hidden on mobile, shown in drawer) */}
          <div className='relative lg:col-span-5 rounded-lg overflow-hidden hidden lg:block'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              {/* progress bar using activeSectionIndex */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200"/>
              <hr className="absolute top-0 left-0  h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000" style={{width: progressWidth}}/>

              {/* Section Navigation */}
              <div className="flex flex-col gap-3 mb-6 border-b border-gray-300 py-3">
                <div className='flex items-center justify-between w-full'>
                  <div className='flex flex-col items-start'>
                    <p className='text-[10px] text-gray-500 mb-1 font-medium'>Customize</p>
                    <div className='flex items-center gap-2'>
                      <TemplateSelector selectedTemplate={resumeData.template} onChange={(template)=> setResumeData(prev => ({...prev, template}))}/>
                      <ColorPicker selectedColor={resumeData.accent_color} onChange={(color)=>setResumeData(prev => ({...prev, accent_color: color}))}/>
                      <SectionOrderButton resumeData={resumeData} setResumeData={setResumeData} />
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {!isFirstSection && (
                      <button onClick={goToPreviousSection} className='flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all'>
                        <ChevronLeft className="size-4"/> <span>Previous</span>
                      </button>
                    )}
                    <button onClick={goToNextSection} className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${isLastSection && 'opacity-50'}`} disabled={isLastSection}>
                      <span>Next</span> <ChevronRight className="size-4"/>
                    </button>
                  </div>
                </div>

                <SectionTabs activeIndex={activeSectionIndex} onSelect={setActiveSectionIndex} sectionVisibility={resumeData.sectionVisibility} />
              </div>

              {/* Form Content */}
              <div className='space-y-6'>
                <SectionEditor sectionId={activeSection.id} resumeData={resumeData} setResumeData={setResumeData} />
              </div>
            </div>
          </div>

          {/* Right Panel - Preview / Profile Data */}
          <div className='lg:col-span-7 w-full overflow-hidden'>
              {/* Action Buttons at top */}
              <div className='w-full mb-3'>
                <div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between max-w-full'>

                  {/* Edit Resume Button (Mobile) */}
                  <button
                    onClick={() => setIsMobileDrawerOpen(true)}
                    className='lg:hidden flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm rounded-lg transition-all font-medium shadow-md lg:shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                  >
                    <Edit3 className='size-3.5 lg:size-4'/>
                    <span className='whitespace-nowrap'>Edit Resume</span>
                  </button>

                  {/* Show Profile Data Toggle (Desktop) */}
                  <button
                    onClick={() => setShowProfileData(!showProfileData)}
                    className={`hidden lg:flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm rounded-lg transition-all font-medium shadow-md lg:shadow-lg ${
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
                    <button
                      onClick={togglePublic}
                      title={resumeData.public ? 'Anyone with the link can view this resume. Click to make it private.' : 'Only you can see this resume. Click to make it shareable.'}
                      className={`flex items-center justify-center px-3 lg:px-4 py-2 lg:py-2.5 gap-1.5 lg:gap-2 text-xs lg:text-sm rounded-lg border lg:border-2 transition-all font-medium shadow-md lg:shadow-lg flex-1 lg:flex-initial ${resumeData.public ? 'bg-white text-green-700 border-green-200 hover:bg-green-50' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {resumeData.public ? <EyeIcon className='size-3.5 lg:size-4'/> : <EyeOffIcon className='size-3.5 lg:size-4'/>}
                      <span className='whitespace-nowrap'>{resumeData.public ? 'Public' : 'Private'}</span>
                    </button>

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
                      onClick={saveResume}
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
                      <span aria-live='polite' className={`text-[10px] lg:text-xs px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg font-medium shadow-md lg:shadow-lg ${autoSaveStatus === 'saving' ? 'text-gray-700 bg-white border border-gray-200 lg:border-2' : autoSaveStatus === 'error' ? 'text-red-700 bg-red-50 border border-red-200 lg:border-2' : 'text-green-700 bg-white border border-green-200 lg:border-2'}`}>
                        {autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'error' ? 'Autosave failed — click Save' : '✓ Saved'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <JobMatchPanel resumeId={resumeId} token={token} resumeData={resumeData} profileData={defaultResumeData} />

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
                  <ProfileDataPanel data={defaultResumeData} />
                </div>
              )}
          </div>
        </div>
      </div>

      <CustomPromptModal
        isOpen={showCustomPrompt}
        onClose={() => setShowCustomPrompt(false)}
        resumeData={resumeData}
        setResumeData={setResumeData}
      />

      <JobRequirementsModal
        isOpen={isRequirementsModalOpen}
        onClose={() => setIsRequirementsModalOpen(false)}
        jobDescription={resumeData.job_description}
      />

      {showTemplateSelector && (
        <TemplateSheet
          selected={resumeData.template}
          onSelect={(template) => setResumeData(prev => ({...prev, template}))}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {showSectionOrder && (
        <SectionOrderSheet
          resumeData={resumeData}
          setResumeData={setResumeData}
          onClose={() => setShowSectionOrder(false)}
        />
      )}

      {showColorPicker && (
        <ColorSheet
          selected={resumeData.accent_color}
          onSelect={(color) => setResumeData(prev => ({...prev, accent_color: color}))}
          onClose={() => setShowColorPicker(false)}
        />
      )}

      {/* Mobile Drawer for Editing */}
      {isMobileDrawerOpen && (
        <BottomDrawer
          label='Edit Resume'
          header={<h2 className='text-base font-semibold text-gray-900'>Edit Resume</h2>}
          onClose={() => setIsMobileDrawerOpen(false)}
        >
          <div className='p-3 pb-6 max-w-full'>
            <div className='bg-gray-50 rounded-lg border border-gray-200 p-3 w-full overflow-hidden'>
              {/* progress bar using activeSectionIndex */}
              <div className='relative mb-3 w-full'>
                <hr className="border border-gray-300"/>
                <hr className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000" style={{width: progressWidth}}/>
              </div>

              {/* Section Navigation */}
              <div className="flex flex-col justify-between items-start mb-3 border-b border-gray-300 pb-3 gap-3 w-full">
                <div className='w-full'>
                  <p className='text-[10px] text-gray-500 mb-0.5'>Editing Section</p>
                  <p className='text-base font-semibold text-gray-900'>{activeSection.name}</p>
                </div>

                <SectionTabs activeIndex={activeSectionIndex} onSelect={setActiveSectionIndex} sectionVisibility={resumeData.sectionVisibility} compact />

                <div className='flex items-center gap-2 w-full justify-between'>
                  <button
                    onClick={goToPreviousSection}
                    className='flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1'
                    disabled={isFirstSection}
                  >
                    <ChevronLeft className="size-3.5"/> <span>Prev</span>
                  </button>
                  <button
                    onClick={goToNextSection}
                    className='flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1'
                    disabled={isLastSection}
                  >
                    <span>Next</span> <ChevronRight className="size-3.5"/>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className='space-y-4 w-full overflow-hidden'>
                <SectionEditor sectionId={activeSection.id} resumeData={resumeData} setResumeData={setResumeData} compact />
              </div>
            </div>
          </div>
        </BottomDrawer>
      )}

      {/* Profile Data Drawer */}
      {isProfileDataDrawerOpen && (
        <BottomDrawer
          label='My Profile Data'
          header={
            <div>
              <h2 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                <DatabaseIcon className='size-5 text-yellow-600'/>
                My Profile Data
              </h2>
              <p className='text-gray-500 text-xs mt-0.5'>Reference and copy content to use in your resume</p>
            </div>
          }
          onClose={() => setIsProfileDataDrawerOpen(false)}
        >
          <div className='p-4 pb-6 max-w-full'>
            <ProfileDataPanel data={defaultResumeData} compact />
          </div>
        </BottomDrawer>
      )}

    </>
  )
}

export default ResumeBuilder
