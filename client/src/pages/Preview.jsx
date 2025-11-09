import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import ResumePreview from '../components/ResumePreview'
import Loader from '../components/Loader'
import JobRequirementsModal from '../components/JobRequirementsModal'
import { ArrowLeftIcon, Briefcase } from 'lucide-react'
import api from '../configs/api'

const Preview = () => {
  const { resumeId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState(null)
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false)

  const loadResume = async () => {
    try {
      const { data } = await api.get('/api/resumes/public/' + resumeId)
      setResumeData(data.resume)
    } catch (error) {
      console.log(error.message);
    }finally{
      setIsLoading(false)
    }
  }

  useEffect(()=>{
    loadResume()
  },[])
  return resumeData ? (
    <div className='bg-slate-100 min-h-screen'>
      <div className='max-w-3xl mx-auto px-4 py-6 sm:py-10'>
        {/* Job Requirements Button */}
        <div className='mb-4 flex justify-end'>
          <button
            onClick={() => setIsRequirementsModalOpen(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg transition-colors text-sm sm:text-base'
          >
            <Briefcase className='size-5' />
            <span>What This Job Needs</span>
          </button>
        </div>

        <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} classes='py-4 bg-white'/>
      </div>

      {/* Job Requirements Modal */}
      <JobRequirementsModal
        isOpen={isRequirementsModalOpen}
        onClose={() => setIsRequirementsModalOpen(false)}
        jobDescription={resumeData?.job_description}
      />
    </div>
  ) : (
    <div>
      {isLoading ? <Loader /> : (
        <div className='flex flex-col items-center justify-center h-screen px-4'>
          <p className='text-center text-3xl sm:text-4xl md:text-6xl text-slate-400 font-medium'>Resume not found</p>
          <a href="/" className='mt-6 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 h-9 m-1 ring-offset-1 ring-1 ring-green-400 flex items-center transition-colors text-sm sm:text-base'>
            <ArrowLeftIcon className='mr-2 size-4'/>
            go to home page
          </a>
        </div>
      )}
    </div>
  )
}

export default Preview
