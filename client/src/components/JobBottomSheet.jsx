import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import JobDetail from './JobDetail'

const JobBottomSheet = ({ job, onClose, onApply, onApplyExternal }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!job) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/40 z-40'
        onClick={onClose}
      />
      {/* Sheet */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]'>
        {/* Handle + close */}
        <div className='relative flex items-center justify-between px-4 pt-3 pb-2'>
          <div className='w-10 h-1 bg-gray-300 rounded-full absolute left-1/2 -translate-x-1/2 top-3' />
          <div />
          <button onClick={onClose} className='p-1.5 rounded-full hover:bg-gray-100 text-gray-500'>
            <X className='size-5' />
          </button>
        </div>
        {/* Detail content */}
        <div className='flex-1 overflow-y-auto px-4 pb-6'>
          <JobDetail job={job} onApply={onApply} onApplyExternal={onApplyExternal} />
        </div>
      </div>
    </>
  )
}

export default JobBottomSheet
