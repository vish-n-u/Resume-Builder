import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import ResumePreview from '../components/ResumePreview'
import Loader from '../components/Loader'
import JobRequirementsModal from '../components/JobRequirementsModal'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import { ArrowLeftIcon, Briefcase, Palette, X } from 'lucide-react'
import api from '../configs/api'

const Preview = () => {
  const { resumeId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState(null)
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState('classic')
  const [currentAccentColor, setCurrentAccentColor] = useState('#000000')

  const loadResume = async () => {
    try {
      const { data } = await api.get('/api/resumes/public/' + resumeId)
      setResumeData(data.resume)
      setCurrentTemplate(data.resume.template || 'classic')
      setCurrentAccentColor(data.resume.accent_color || '#000000')
    } catch (error) {
      // Error loading resume
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
        {/* Action Buttons */}
        <div className='mb-4 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center'>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className='bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 shadow-lg transition-colors text-sm sm:text-base'
          >
            <Palette className='size-5' />
            <span>Customize Template</span>
          </button>

          <button
            onClick={() => setIsRequirementsModalOpen(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 shadow-lg transition-colors text-sm sm:text-base'
          >
            <Briefcase className='size-5' />
            <span>What This Job Needs</span>
          </button>
        </div>

        <ResumePreview data={resumeData} template={currentTemplate} accentColor={currentAccentColor} classes='py-4 bg-white'/>
      </div>

      {/* Drawer for Template Customization */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/50 z-40 transition-opacity'
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className='fixed bottom-0 left-0 right-0 sm:top-0 sm:right-0 sm:left-auto sm:bottom-auto sm:w-96 bg-white z-50 shadow-2xl transform transition-transform sm:h-full'>
            {/* Drawer Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>Customize Resume</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='size-5' />
              </button>
            </div>

            {/* Drawer Content */}
            <div className='p-4 space-y-6 overflow-y-auto max-h-[70vh] sm:max-h-[calc(100vh-80px)]'>
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>Select Template</h3>
                <TemplateSelector
                  selectedTemplate={currentTemplate}
                  onChange={setCurrentTemplate}
                />
              </div>

              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>Select Accent Color</h3>
                <ColorPicker
                  selectedColor={currentAccentColor}
                  onChange={setCurrentAccentColor}
                />
              </div>
            </div>
          </div>
        </>
      )}

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
