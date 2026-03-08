import React from 'react'
import { MapPin, Building2, Clock, DollarSign, Briefcase } from 'lucide-react'

const JobCard = ({ job }) => {
  return (
    <div className='w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col'>
      {/* Header */}
      <div className='p-5 pb-3'>
        <div className='flex items-start gap-4'>
          <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0'>
            {job.company?.charAt(0) || '?'}
          </div>
          <div className='min-w-0'>
            <h2 className='text-xl font-bold text-gray-900 leading-tight'>{job.title}</h2>
            <p className='text-blue-600 font-semibold mt-1 flex items-center gap-1.5'>
              <Building2 className='size-4' />
              {job.company}
            </p>
          </div>
        </div>
      </div>

      {/* Meta tags */}
      <div className='px-6 flex flex-wrap gap-2'>
        {job.location && (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full'>
            <MapPin className='size-3' />
            {job.location}
          </span>
        )}
        {job.type && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${
            job.type === 'remote' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            <Briefcase className='size-3' />
            {job.type}
          </span>
        )}
        {job.salary && (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full'>
            <DollarSign className='size-3' />
            {job.salary}
          </span>
        )}
      </div>

      {/* Description */}
      <div className='px-5 py-3 flex-1 overflow-y-auto'>
        <p className='text-sm text-gray-600 leading-relaxed'>
          {job.description}
        </p>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className='px-6 pb-4'>
          <div className='flex flex-wrap gap-1.5'>
            {job.skills.slice(0, 6).map((skill, i) => (
              <span key={i} className='text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium'>
                {skill}
              </span>
            ))}
            {job.skills.length > 6 && (
              <span className='text-xs text-gray-400 px-2 py-1'>+{job.skills.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {/* Posted date */}
      <div className='px-5 pb-4'>
        <p className='text-xs text-gray-400 flex items-center gap-1'>
          <Clock className='size-3' />
          {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Recently posted'}
        </p>
      </div>
    </div>
  )
}

export default JobCard
