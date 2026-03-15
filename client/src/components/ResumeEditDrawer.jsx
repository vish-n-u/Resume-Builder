import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

const ResumeEditDrawer = ({ resume, onChange, onBlur, onClose }) => {
  const [newSkill, setNewSkill] = useState('')

  const handleSummaryChange = (e) => {
    onChange('professional_summary', e.target.value)
  }

  const handleSummaryBlur = () => {
    onBlur()
  }

  const handleExperienceChange = (index, value) => {
    const updated = resume.experience.map((exp, i) =>
      i === index ? { ...exp, description: value } : exp
    )
    onChange('experience', updated)
  }

  const handleExperienceBlur = () => {
    onBlur()
  }

  const handleAddSkill = () => {
    const skill = newSkill.trim()
    if (!skill) return
    if (resume.skills.includes(skill)) return
    onChange('skills', [...resume.skills, skill])
    setNewSkill('')
    onBlur()
  }

  const handleRemoveSkill = (skill) => {
    onChange('skills', resume.skills.filter(s => s !== skill))
    onBlur()
  }

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/20 z-10' onClick={onClose} />

      {/* Drawer */}
      <div className='absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white z-20 flex flex-col shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0'>
          <h3 className='text-base font-semibold text-gray-900'>Edit Resume</h3>
          <button
            onClick={onClose}
            className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-500'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto px-5 py-4 space-y-6'>

          {/* Professional Summary */}
          <div>
            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
              Professional Summary
            </label>
            <textarea
              value={resume.professional_summary || ''}
              onChange={handleSummaryChange}
              onBlur={handleSummaryBlur}
              rows={5}
              className='w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              placeholder='Write a compelling summary...'
            />
          </div>

          {/* Experience */}
          {resume.experience?.length > 0 && (
            <div>
              <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                Experience
              </label>
              <div className='space-y-4'>
                {resume.experience.map((exp, index) => (
                  <div key={index}>
                    <p className='text-sm font-medium text-gray-800 mb-0.5'>
                      {exp.position}
                    </p>
                    <p className='text-xs text-gray-500 mb-1.5'>{exp.company}</p>
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => handleExperienceChange(index, e.target.value)}
                      onBlur={handleExperienceBlur}
                      rows={4}
                      className='w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                      placeholder='Describe your responsibilities and achievements...'
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
              Skills
            </label>
            <div className='flex flex-wrap gap-1.5 mb-3'>
              {(resume.skills || []).map((skill) => (
                <span
                  key={skill}
                  className='inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md'
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className='hover:text-blue-900 ml-0.5'
                  >
                    <X className='size-3' />
                  </button>
                </span>
              ))}
            </div>
            <div className='flex gap-2'>
              <input
                type='text'
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder='Add a skill...'
                className='flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button
                onClick={handleAddSkill}
                className='px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus className='size-4' />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className='px-5 py-3 border-t border-gray-100 shrink-0'>
          <p className='text-xs text-gray-400 text-center'>Changes save automatically</p>
        </div>
      </div>
    </>
  )
}

export default ResumeEditDrawer
