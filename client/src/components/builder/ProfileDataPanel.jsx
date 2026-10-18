import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Briefcase, CopyIcon, DatabaseIcon, FileText, FolderIcon, GraduationCap, Sparkles, Trophy } from 'lucide-react'
import { sanitizeHtml } from '../../utils/sanitize'

// Read-only view of the user's saved profile data, for copying content into the resume.
// `compact` is the smaller layout used in the mobile drawer.
const ProfileDataPanel = ({ data, compact = false }) => {
  if (!data) {
    return (
      <div className='text-center py-12'>
        <DatabaseIcon className='size-16 mx-auto text-gray-300 mb-4'/>
        <p className={`text-gray-500 ${compact ? 'text-base' : 'text-lg'}`}>No profile data found</p>
        <Link to='/app/profile' className={`text-yellow-600 hover:underline mt-2 inline-block ${compact ? 'text-sm' : ''}`}>
          Go to Profile to add your data
        </Link>
      </div>
    )
  }


  // Spacing between cards inside a group; smaller cards (certifications, achievements) sit closer together
  const listSpacing = (small) => compact ? (small ? 'space-y-2' : 'space-y-3') : (small ? 'space-y-3' : 'space-y-4')

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      {data.professional_summary && (
        <DataSection title="Professional Summary" icon={FileText} content={data.professional_summary} />
      )}

      {data.skills?.length > 0 && (
        <DataGroup compact={compact} title="Skills" icon={Sparkles} tight>
          <div className='flex flex-wrap gap-2'>
            {data.skills.map((skill, index) => <CopyableChip key={index} text={skill} />)}
          </div>
        </DataGroup>
      )}

      {data.experience?.length > 0 && (
        <DataGroup compact={compact} title="Experience" icon={Briefcase}>
          <div className={listSpacing(false)}>
            {data.experience.map((exp, index) => <ExperienceCard key={index} experience={exp} />)}
          </div>
        </DataGroup>
      )}

      {data.education?.length > 0 && (
        <DataGroup compact={compact} title="Education" icon={GraduationCap}>
          <div className={listSpacing(false)}>
            {data.education.map((edu, index) => <EducationCard key={index} education={edu} />)}
          </div>
        </DataGroup>
      )}

      {data.project?.length > 0 && (
        <DataGroup compact={compact} title="Projects" icon={FolderIcon}>
          <div className={listSpacing(false)}>
            {data.project.map((proj, index) => <ProjectCard key={index} project={proj} />)}
          </div>
        </DataGroup>
      )}

      {data.certifications?.length > 0 && (
        <DataGroup compact={compact} title="Certifications" icon={Award}>
          <div className={listSpacing(true)}>
            {data.certifications.map((cert, index) => <CertificationCard key={index} certification={cert} />)}
          </div>
        </DataGroup>
      )}

      {data.achievements?.length > 0 && (
        <DataGroup compact={compact} title="Achievements" icon={Trophy}>
          <div className={listSpacing(true)}>
            {data.achievements.map((ach, index) => <AchievementCard key={index} achievement={ach} />)}
          </div>
        </DataGroup>
      )}
    </div>
  )
}

const DataGroup = ({ title, icon: Icon, tight, compact, children }) => (
  <div className={`bg-gray-50 rounded-lg border border-gray-200 ${compact ? 'p-4' : 'p-5'}`}>
    <h3 className={`font-semibold text-gray-800 flex items-center gap-2 ${compact ? 'mb-3 text-sm' : (tight ? 'mb-3' : 'mb-4')}`}>
      <Icon className={`${compact ? 'size-4' : 'size-5'} text-yellow-600`}/>
      {title}
    </h3>
    {children}
  </div>
)

const DataSection = ({ title, icon: Icon, content }) => {
  return (
    <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
          <Icon className='size-5 text-yellow-600'/>
          {title}
        </h3>
      </div>
      <div className='text-gray-700 text-sm leading-relaxed' dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
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
      title='Copy'
      className='px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full text-sm transition-colors flex items-center gap-1'
    >
      {text}
      {copied && <CopyIcon className='size-3'/>}
    </button>
  )
}

const ExperienceCard = ({ experience }) => {
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
      </div>
      <div className='text-sm text-gray-700 mt-2' dangerouslySetInnerHTML={{ __html: sanitizeHtml(experience.description) }} />
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
  return (
    <div className='bg-white p-4 rounded-lg border border-gray-200'>
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-semibold text-gray-800'>{project.name}</h4>
          {project.type && <p className='text-sm text-gray-600'>{project.type}</p>}
        </div>
      </div>
      <div className='text-sm text-gray-700 mt-2' dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.description) }} />
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
  return (
    <div className='bg-white p-3 rounded-lg border border-gray-200'>
      <div className='flex justify-between items-start'>
        <h4 className='font-semibold text-gray-800 text-sm'>{achievement.title}</h4>
      </div>
      <div className='text-sm text-gray-700 mt-1' dangerouslySetInnerHTML={{ __html: sanitizeHtml(achievement.description) }} />
    </div>
  )
}

export default ProfileDataPanel
