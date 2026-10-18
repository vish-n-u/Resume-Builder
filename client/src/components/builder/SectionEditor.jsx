import React from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import PersonalInfoForm from '../PersonalInfoForm'
import ProfessionalSummaryForm from '../ProfessionalSummaryForm'
import ExperienceForm from '../ExperienceForm'
import EducationForm from '../EducationForm'
import ProjectForm from '../ProjectForm'
import SkillsForm from '../SkillsForm'
import CertificationsForm from '../CertificationsForm'
import AchievementsForm from '../AchievementsForm'
import CustomSectionsForm from '../CustomSectionsForm'
import { BUILDER_SECTIONS } from './sections'

// Show/hide switch for a section in the resume preview. `compact` is the smaller mobile-drawer size.
const SectionVisibilityToggle = ({ visible, onToggle, compact }) => (
  <div className={`flex flex-col items-end ${compact ? 'gap-0.5' : 'gap-1'}`}>
    <button
      onClick={onToggle}
      aria-pressed={visible}
      className={`flex items-center rounded-lg transition-all font-medium text-xs ${compact ? 'gap-1 px-2.5 py-1' : 'gap-1.5 px-3 py-1.5'} ${
        visible
          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
          : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
      }`}
      title={compact
        ? (visible ? 'Click to hide in preview' : 'Click to show in preview')
        : (visible ? 'Click to hide this section in resume preview' : 'Click to show this section in resume preview')}
    >
      {visible ? <EyeIcon className={compact ? 'size-3.5' : 'size-4'}/> : <EyeOffIcon className={compact ? 'size-3.5' : 'size-4'}/>}
      <span className={compact ? 'text-[10px]' : ''}>{visible ? 'Visible' : 'Hidden'}</span>
    </button>
    <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-gray-500`}>{compact ? 'Toggle visibility' : "Toggle section's visibility"}</p>
  </div>
)

// Renders the form for one builder section, with its heading and visibility toggle
const SectionEditor = ({ sectionId, resumeData, setResumeData, compact = false }) => {
  const update = (field) => (value) => setResumeData(prev => ({ ...prev, [field]: value }))

  if (sectionId === 'personal') {
    return <PersonalInfoForm data={resumeData.personal_info} onChange={update('personal_info')} />
  }

  const forms = {
    summary: <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={update('professional_summary')} jobDescription={resumeData.job_description}/>,
    experience: <ExperienceForm data={resumeData.experience} onChange={update('experience')} jobDescription={resumeData.job_description}/>,
    education: <EducationForm data={resumeData.education} onChange={update('education')}/>,
    projects: <ProjectForm data={resumeData.project} onChange={update('project')} jobDescription={resumeData.job_description}/>,
    skills: <SkillsForm data={resumeData.skills} onChange={update('skills')}/>,
    certifications: <CertificationsForm data={resumeData.certifications} onChange={update('certifications')}/>,
    achievements: <AchievementsForm data={resumeData.achievements} onChange={update('achievements')}/>,
    customSections: <CustomSectionsForm data={resumeData.custom_sections} onChange={update('custom_sections')}/>,
  }

  const section = BUILDER_SECTIONS.find(s => s.id === sectionId)
  if (!section || !forms[sectionId]) return null

  const visible = !!resumeData.sectionVisibility?.[sectionId]
  const toggleVisibility = () => setResumeData(prev => ({
    ...prev,
    sectionVisibility: { ...prev.sectionVisibility, [sectionId]: !prev.sectionVisibility?.[sectionId] }
  }))

  return (
    <div>
      <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-2'}`}>
        <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-gray-900`}>{section.title}</h3>
        <SectionVisibilityToggle visible={visible} onToggle={toggleVisibility} compact={compact} />
      </div>
      {forms[sectionId]}
    </div>
  )
}

export default SectionEditor
