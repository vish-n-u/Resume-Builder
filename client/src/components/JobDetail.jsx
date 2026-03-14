import React from 'react'
import { MapPin, DollarSign, ExternalLink, Sparkles } from 'lucide-react'

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-rose-500',
  'bg-emerald-600', 'bg-orange-500', 'bg-cyan-600',
]
const avatarColor = (company = '') =>
  AVATAR_COLORS[company.charCodeAt(0) % AVATAR_COLORS.length]

const JobDetail = ({ job, onApply, onApplyExternal }) => {
  if (!job) {
    return (
      <div className='flex items-center justify-center h-full text-gray-400 text-sm'>
        Select a job to view details
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full overflow-y-auto'>
      {/* Header */}
      <div className='flex items-start gap-4 pb-4 border-b border-gray-100 mb-4'>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 ${avatarColor(job.company)}`}>
          {job.company?.charAt(0) || '?'}
        </div>
        <div className='min-w-0 flex-1'>
          <h2 className='text-xl font-bold text-gray-900 leading-tight'>{job.title}</h2>
          <p className='text-sm text-gray-500 mt-0.5'>{job.company}</p>
          <div className='flex flex-wrap gap-2 mt-2'>
            {job.type && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                job.type === 'remote' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {job.type === 'remote' ? 'Remote' : 'On-site'}
              </span>
            )}
            {job.location && (
              <span className='text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full flex items-center gap-1'>
                <MapPin className='size-3' />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span className='text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1'>
                <DollarSign className='size-3' />
                {job.salary}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className='mb-4'>
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Required Skills</p>
          <div className='flex flex-wrap gap-1.5'>
            {job.skills.map((skill, i) => (
              <span key={i} className='text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md'>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className='flex-1 mb-6'>
        <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Description</p>
        <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-line'>{job.description}</p>
      </div>

      {/* Actions */}
      <div className='flex flex-col gap-2 pt-4 border-t border-gray-100'>
        <button
          onClick={onApply}
          className='w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2'
        >
          <Sparkles className='size-4' />
          Apply with AI Resume
        </button>
        {job.applyUrl && (
          <button
            onClick={onApplyExternal}
            className='w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2'
          >
            <ExternalLink className='size-4' />
            Apply on Company Site
          </button>
        )}
      </div>
    </div>
  )
}

export default JobDetail
