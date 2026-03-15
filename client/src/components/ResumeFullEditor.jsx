import React, { useState, useEffect, useRef } from 'react'
import { X, User, FileText, Briefcase, GraduationCap, FolderIcon, Sparkles, Award, Trophy, Plus, EyeIcon, EyeOffIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import api from '../configs/api'
import ResumePreview from './ResumePreview'
import PersonalInfoForm from './PersonalInfoForm'
import ProfessionalSummaryForm from './ProfessionalSummaryForm'
import ExperienceForm from './ExperienceForm'
import EducationForm from './EducationForm'
import ProjectForm from './ProjectForm'
import SkillsForm from './SkillsForm'
import CertificationsForm from './CertificationsForm'
import AchievementsForm from './AchievementsForm'
import CustomSectionsForm from './CustomSectionsForm'

const sections = [
  { id: 'personal', name: 'Personal Info', icon: User },
  { id: 'summary', name: 'Summary', icon: FileText },
  { id: 'experience', name: 'Experience', icon: Briefcase },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'projects', name: 'Projects', icon: FolderIcon },
  { id: 'skills', name: 'Skills', icon: Sparkles },
  { id: 'certifications', name: 'Certifications', icon: Award },
  { id: 'achievements', name: 'Achievements', icon: Trophy },
  { id: 'customSections', name: 'Custom Sections', icon: Plus },
]

const ResumeFullEditor = ({ resume, onClose }) => {
  const { token } = useSelector(state => state.auth)
  const [resumeData, setResumeData] = useState(resume)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const isInitialLoad = useRef(true)
  const saveTimeoutRef = useRef(null)

  const activeSection = sections[activeSectionIndex]

  // Auto-save 3 seconds after any change
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }
    clearTimeout(saveTimeoutRef.current)
    setAutoSaveStatus('saving')
    saveTimeoutRef.current = setTimeout(() => {
      autoSave()
    }, 3000)
    return () => clearTimeout(saveTimeoutRef.current)
  }, [resumeData])

  const autoSave = async () => {
    try {
      const formData = new FormData()
      formData.append('resumeId', resumeData._id)
      formData.append('resumeData', JSON.stringify(resumeData))
      await api.put('/api/resumes/update', formData, { headers: { Authorization: token } })
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus(''), 2000)
    } catch {
      setAutoSaveStatus('')
      toast.error('Failed to save resume')
    }
  }

  const toggleSectionVisibility = (sectionId) => {
    setResumeData(prev => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [sectionId]: !prev.sectionVisibility?.[sectionId],
      },
    }))
  }

  const handleClose = () => {
    clearTimeout(saveTimeoutRef.current)
    onClose(resumeData)
  }

  const hasSectionToggle = activeSection.id !== 'personal'

  return (
    <div className='fixed inset-0 z-[60] bg-white flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 shrink-0'>
        <div className='flex items-center gap-3'>
          <h2 className='text-base font-semibold text-gray-900'>Edit Resume</h2>
          {autoSaveStatus === 'saving' && (
            <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md'>Saving...</span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className='text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-md'>✓ Saved</span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {/* Mobile toggle */}
          <button
            onClick={() => setShowPreview(p => !p)}
            className='lg:hidden text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50'
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleClose}
            className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-500'
          >
            <X className='size-5' />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className='flex-1 overflow-hidden flex'>

        {/* Left panel — section nav + form */}
        <div className={`w-full lg:w-[420px] xl:w-[480px] flex flex-col border-r border-gray-200 ${showPreview ? 'hidden lg:flex' : 'flex'}`}>

          {/* Section tabs */}
          <div className='flex items-center gap-1 px-4 py-2 border-b border-gray-100 overflow-x-auto shrink-0'>
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionIndex(index)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    index === activeSectionIndex
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <Icon className='size-3.5 shrink-0' />
                  <span className='hidden sm:inline'>{section.name}</span>
                </button>
              )
            })}
          </div>

          {/* Navigation arrows + section title */}
          <div className='flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold text-gray-800'>{activeSection.name}</h3>
              {hasSectionToggle && (
                <button
                  onClick={() => toggleSectionVisibility(activeSection.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                    resumeData.sectionVisibility?.[activeSection.id]
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  {resumeData.sectionVisibility?.[activeSection.id] ? (
                    <><EyeIcon className='size-3' /> Visible</>
                  ) : (
                    <><EyeOffIcon className='size-3' /> Hidden</>
                  )}
                </button>
              )}
            </div>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setActiveSectionIndex(i => Math.max(i - 1, 0))}
                disabled={activeSectionIndex === 0}
                className='p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <ChevronLeft className='size-4 text-gray-600' />
              </button>
              <button
                onClick={() => setActiveSectionIndex(i => Math.min(i + 1, sections.length - 1))}
                disabled={activeSectionIndex === sections.length - 1}
                className='p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <ChevronRight className='size-4 text-gray-600' />
              </button>
            </div>
          </div>

          {/* Form content */}
          <div className='flex-1 overflow-y-auto px-5 py-4'>
            {activeSection.id === 'personal' && (
              <PersonalInfoForm
                data={resumeData.personal_info}
                onChange={(data) => setResumeData(prev => ({ ...prev, personal_info: data }))}
              />
            )}
            {activeSection.id === 'summary' && (
              <ProfessionalSummaryForm
                data={resumeData.professional_summary}
                onChange={(data) => setResumeData(prev => ({ ...prev, professional_summary: data }))}
                setResumeData={setResumeData}
              />
            )}
            {activeSection.id === 'experience' && (
              <ExperienceForm
                data={resumeData.experience}
                onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))}
                jobDescription={resumeData.job_description}
              />
            )}
            {activeSection.id === 'education' && (
              <EducationForm
                data={resumeData.education}
                onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))}
              />
            )}
            {activeSection.id === 'projects' && (
              <ProjectForm
                data={resumeData.project}
                onChange={(data) => setResumeData(prev => ({ ...prev, project: data }))}
              />
            )}
            {activeSection.id === 'skills' && (
              <SkillsForm
                data={resumeData.skills}
                onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))}
              />
            )}
            {activeSection.id === 'certifications' && (
              <CertificationsForm
                data={resumeData.certifications}
                onChange={(data) => setResumeData(prev => ({ ...prev, certifications: data }))}
              />
            )}
            {activeSection.id === 'achievements' && (
              <AchievementsForm
                data={resumeData.achievements}
                onChange={(data) => setResumeData(prev => ({ ...prev, achievements: data }))}
              />
            )}
            {activeSection.id === 'customSections' && (
              <CustomSectionsForm
                data={resumeData.custom_sections}
                onChange={(data) => setResumeData(prev => ({ ...prev, custom_sections: data }))}
              />
            )}
          </div>
        </div>

        {/* Right panel — live preview */}
        <div className={`flex-1 overflow-y-auto bg-gray-50 px-6 py-4 ${showPreview ? 'flex flex-col' : 'hidden lg:block'}`}>
          <ResumePreview
            data={resumeData}
            template={resumeData.template || 'classic'}
            accentColor={resumeData.accent_color || '#000000'}
          />
        </div>
      </div>
    </div>
  )
}

export default ResumeFullEditor
