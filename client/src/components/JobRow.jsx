import React from 'react'
import { avatarColor } from '../utils/jobAvatar'

const JobRow = ({ job, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-xl border transition-all ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 bg-white hover:bg-gray-50'
    }`}
  >
    <div className='flex items-start gap-3'>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 ${avatarColor(job.company)}`}>
        {job.company?.charAt(0) || '?'}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-gray-900 truncate'>{job.title}</p>
        <p className='text-xs text-gray-500 truncate'>{job.company} · {job.location}</p>
        <div className='flex gap-1.5 mt-1.5 flex-wrap'>
          {job.type && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              job.type === 'remote' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {job.type === 'remote' ? 'Remote' : 'On-site'}
            </span>
          )}
          {job.salary && (
            <span className='text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>
              {job.salary}
            </span>
          )}
        </div>
      </div>
    </div>
  </button>
)

export default JobRow
