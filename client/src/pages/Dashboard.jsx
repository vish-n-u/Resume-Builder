import { FilePenLineIcon, LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon, UploadCloud, UploadCloudIcon, XIcon, SparklesIcon, BriefcaseIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { dummyResumeData } from '../assets/assets'
import {useNavigate} from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'

const Dashboard = () => {

  const {user, token} = useSelector(state => state.auth)

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"]
  const [allResumes, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [showJobDescriptionModal, setShowJobDescriptionModal] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [hasDefaultResumeData, setHasDefaultResumeData] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const navigate = useNavigate()

  const checkDefaultResumeData = async () => {
    try {
      const { data } = await api.get('/api/users/default-resume-data', {headers: { Authorization: token }})
      const hasData = data.defaultResumeData && Object.keys(data.defaultResumeData).length > 0

      // Check if there's meaningful data (not just empty fields)
      const hasMeaningfulData = hasData && (
        data.defaultResumeData.personal_info?.full_name ||
        data.defaultResumeData.professional_summary ||
        (data.defaultResumeData.experience && data.defaultResumeData.experience.length > 0) ||
        (data.defaultResumeData.education && data.defaultResumeData.education.length > 0)
      )

      setHasDefaultResumeData(hasMeaningfulData)
      if (!hasMeaningfulData) {
        setShowOnboarding(true)
      }
    } catch (error) {
      console.error('Error checking default resume data:', error)
      setHasDefaultResumeData(false)
      setShowOnboarding(true)
    }
  }

  const loadAllResumes = async () =>{
    try {
      const { data } = await api.get('/api/users/resumes', {headers: { Authorization: token }})
      setAllResumes(data.resumes)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const createResume = async (event) => {
   try {
    event.preventDefault()
    const { data } = await api.post('/api/resumes/create', {title}, {headers: { Authorization: token }})
    setAllResumes([...allResumes, data.resume])
    setTitle('')
    setShowCreateResume(false)
    navigate(`/app/builder/${data.resume._id}`)
   } catch (error) {
    toast.error(error?.response?.data?.message || error.message)
   }
  }

  const uploadResume = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const resumeText = await pdfToText(resume)

      // If user doesn't have default resume data, save to profile instead of creating resume
      if (hasDefaultResumeData === false) {
        await api.post('/api/ai/upload-resume-to-profile', {resumeText}, {headers: { Authorization: token }})
        setTitle('')
        setResume(null)
        setShowUploadResume(false)
        setHasDefaultResumeData(true) // Update state
        toast.success('Resume uploaded successfully! Please review and complete your profile.')
        navigate('/app/profile?onboarding=true')
      } else {
        // User has profile data, create a new resume
        const { data } = await api.post('/api/ai/upload-resume', {title, resumeText}, {headers: { Authorization: token }})
        setTitle('')
        setResume(null)
        setShowUploadResume(false)
        navigate(`/app/builder/${data.resumeId}`)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  const editTitle = async (event) => {
    try {
      event.preventDefault()
      const {data} = await api.put(`/api/resumes/update`, {resumeId: editResumeId, resumeData: { title }}, {headers: { Authorization: token }})
      setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume))
      setTitle('')
      setEditResumeId('')
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
     
  }

  const deleteResume = async (resumeId) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this resume?')
     if(confirm){
      const {data} = await api.delete(`/api/resumes/delete/${resumeId}`, {headers: { Authorization: token }})
      setAllResumes(allResumes.filter(resume => resume._id !== resumeId))
      toast.success(data.message)
     }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }

  }

  const createTailoredResume = async (event) => {
    event.preventDefault()

    if (!jobDescription.trim()) {
      toast.error('Please enter a job description')
      return
    }

    if (!title.trim()) {
      toast.error('Please enter a resume title')
      return
    }

    setIsLoading(true)
    try {
      // Send job description to AI endpoint
      const { data } = await api.post('/api/ai/tailor-resume',
        { jobDescription, title },
        { headers: { Authorization: token } }
      )

      toast.success('Resume tailored successfully!')
      setJobDescription('')
      setTitle('')
      setShowJobDescriptionModal(false)

      // Navigate to resume builder with the newly created resume
      navigate(`/app/builder/${data.resumeId}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  useEffect(()=>{
    checkDefaultResumeData()
    loadAllResumes()
  },[])

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>

        <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>Welcome, {user?.name}</p>

        {/* AI-Powered Job Description Feature - Main Feature */}
        <div className='bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6 mb-8 shadow-sm'>
          <div className='flex items-start gap-4'>
            <div className='p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg'>
              <SparklesIcon className='size-8 text-white' />
            </div>
            <div className='flex-1'>
              <h2 className='text-xl font-bold text-slate-800 mb-2 flex items-center gap-2'>
                AI-Tailored Resume Creator
                <span className='text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full'>NEW</span>
              </h2>
              <p className='text-slate-600 mb-4'>
                Paste a job description and our AI will create a perfectly tailored resume using your profile data. Highlighting the most relevant skills and experience for the role.
              </p>
              <button
                onClick={() => setShowJobDescriptionModal(true)}
                className='flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all active:scale-95 shadow-md hover:shadow-lg font-medium'
              >
                <BriefcaseIcon className='size-5' />
                Create AI-Tailored Resume
              </button>
            </div>
          </div>
        </div>

        <p className='text-sm font-medium text-slate-500 mb-3'>Or create manually:</p>
        <div className='flex gap-4 '>
            <button onClick={()=> setShowCreateResume(true)} className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <PlusIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500  text-white rounded-full'/>
              <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>Create Blank</p>
            </button>
            <button onClick={()=> setShowUploadResume(true)} className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <UploadCloudIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500  text-white rounded-full'/>
              <p className='text-sm group-hover:text-purple-600 transition-all duration-300'>Upload PDF</p>
            </button>
        </div>

      <hr className='border-slate-300 my-6 sm:w-[305px]' />

      <div className="grid grid-cols-2 sm:flex flex-wrap gap-4 ">
        {allResumes.map((resume, index)=>{
          const baseColor = colors[index % colors.length];
          return (
            <button key={index} onClick={()=> navigate(`/app/builder/${resume._id}`)} className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer' style={{background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`, borderColor: baseColor + '40'}}>

              <FilePenLineIcon className="size-7 group-hover:scale-105 transition-all " style={{ color: baseColor }}/>
              <p className='text-sm group-hover:scale-105 transition-all  px-2 text-center' style={{ color: baseColor }}>{resume.title}</p>
              <p className='absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center' style={{ color: baseColor + '90' }}>
                 Updated on {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
              <div onClick={e=> e.stopPropagation()} className='absolute top-1 right-1 group-hover:flex items-center hidden'>
                <TrashIcon onClick={()=>deleteResume(resume._id)} className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"/>
                <PencilIcon onClick={()=> {setEditResumeId(resume._id); setTitle(resume.title)}} className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"/>
              </div>
            </button>
          )
        })}
      </div>

        {showCreateResume && (
          <form onSubmit={createResume} onClick={()=> setShowCreateResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
              <h2 className='text-xl font-bold mb-4'>Create a Resume</h2>
              <input onChange={(e)=>setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-yellow-600 ring-yellow-600' required/>

              <button className='w-full py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors'>Create Resume</button>
              <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=> {setShowCreateResume(false); setTitle('')}}/>
            </div>
          </form>
        )
        }

        {showUploadResume && (
          <form onSubmit={uploadResume} onClick={()=> setShowUploadResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
              <h2 className='text-xl font-bold mb-4'>{hasDefaultResumeData === false ? 'Upload Resume to Profile' : 'Upload Resume'}</h2>
              {hasDefaultResumeData !== false && (
                <input onChange={(e)=>setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-yellow-600 ring-yellow-600' required/>
              )}
                <div>
                  <label htmlFor="resume-input" className="block text-sm text-slate-700">
                    Select resume file
                    <div className='flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-yellow-500 hover:text-yellow-700 cursor-pointer transition-colors'>
                      {resume ? (
                        <p className='text-yellow-700'>{resume.name}</p>
                      ) : (
                        <>
                          <UploadCloud className='size-14 stroke-1'/>
                          <p>Upload resume</p>
                        </>
                      )}
                    </div>
                  </label>
                  <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e)=> setResume(e.target.files[0])}/>
                </div>
              <button disabled={isLoading} className='w-full py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2'>
                {isLoading && <LoaderCircleIcon className='animate-spin size-4 text-white'/>}
                {isLoading ? 'Uploading...' : 'Upload Resume'}
                
                </button>
              <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=> {setShowUploadResume(false); setTitle('')}}/>
            </div>
          </form>
        )
        }

        {editResumeId && (
          <form onSubmit={editTitle} onClick={()=> setEditResumeId('')} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
              <h2 className='text-xl font-bold mb-4'>Edit Resume Title</h2>
              <input onChange={(e)=>setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-yellow-600 ring-yellow-600' required/>

              <button className='w-full py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors'>Update</button>
              <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=> {setEditResumeId(''); setTitle('')}}/>
            </div>
          </form>
        )
        }

        {/* Onboarding Modal */}
        {showOnboarding && hasDefaultResumeData === false && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='relative bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl'>
              {/* Header */}
              <div className='text-center mb-8'>
                <div className='inline-block p-4 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full mb-4'>
                  <span className='text-5xl'>🌻</span>
                </div>
                <h2 className='text-3xl font-bold text-slate-800 mb-3'>
                  Welcome to Flower Resume!
                </h2>
                <p className='text-lg text-slate-600 max-w-xl mx-auto'>
                  To get started with AI-powered resume generation, we need your professional details first.
                </p>
              </div>

              {/* Options */}
              <div className='grid md:grid-cols-2 gap-4 mb-6'>
                {/* Upload Resume Option */}
                <button
                  onClick={() => {
                    setShowOnboarding(false)
                    setShowUploadResume(true)
                  }}
                  className='group relative bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-300 rounded-xl p-6 text-left transition-all active:scale-95'
                >
                  <div className='flex items-start gap-4'>
                    <div className='p-3 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg group-hover:scale-110 transition-transform'>
                      <UploadCloudIcon className='size-6 text-white' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-bold text-slate-800 mb-2'>
                        Upload Resume
                      </h3>
                      <p className='text-sm text-slate-600'>
                        Have an existing resume? Upload it and we'll extract all your information automatically.
                      </p>
                    </div>
                  </div>
                  <div className='absolute top-4 right-4'>
                    <div className='px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full'>
                      Fastest
                    </div>
                  </div>
                </button>

                {/* Manual Entry Option */}
                <button
                  onClick={() => {
                    setShowOnboarding(false)
                    navigate('/app/profile?onboarding=true')
                  }}
                  className='group relative bg-gradient-to-br from-yellow-50 to-amber-100 hover:from-yellow-100 hover:to-amber-200 border-2 border-yellow-200 hover:border-yellow-300 rounded-xl p-6 text-left transition-all active:scale-95'
                >
                  <div className='flex items-start gap-4'>
                    <div className='p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg group-hover:scale-110 transition-transform'>
                      <FilePenLineIcon className='size-6 text-white' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-bold text-slate-800 mb-2'>
                        Enter Details Manually
                      </h3>
                      <p className='text-sm text-slate-600'>
                        Fill out your information step-by-step. Add experience, education, skills, and more.
                      </p>
                    </div>
                  </div>
                  <div className='absolute top-4 right-4'>
                    <div className='px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full'>
                      Most Control
                    </div>
                  </div>
                </button>
              </div>

              {/* Info Box */}
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                <div className='flex items-start gap-3'>
                  <SparklesIcon className='size-5 text-blue-600 mt-0.5 flex-shrink-0' />
                  <div className='flex-1'>
                    <p className='text-sm text-blue-900 font-medium mb-1'>
                      Why do we need this?
                    </p>
                    <p className='text-sm text-blue-800'>
                      Your profile information is used by our AI to create tailored resumes for each job you apply to. The more detailed you are, the better your resumes will be!
                    </p>
                  </div>
                </div>
              </div>

              {/* Skip Option */}
              <div className='text-center'>
                <button
                  onClick={() => setShowOnboarding(false)}
                  className='text-sm text-slate-500 hover:text-slate-700 underline transition-colors'
                >
                  I'll do this later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Description Modal - AI Tailored Resume */}
        {showJobDescriptionModal && (
          <form onSubmit={createTailoredResume} onClick={()=> setShowJobDescriptionModal(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center p-4'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-2xl p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg'>
                  <SparklesIcon className='size-6 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-slate-800'>Create AI-Tailored Resume</h2>
              </div>

              <p className='text-slate-600 mb-4'>
                Our AI will analyze the job description and create a resume highlighting your most relevant experience and skills from your profile.
              </p>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Resume Title
                  </label>
                  <input
                    onChange={(e)=>setTitle(e.target.value)}
                    value={title}
                    type="text"
                    placeholder='e.g., Senior Software Engineer at Google'
                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Job Description
                    <span className='text-slate-500 text-xs ml-2'>(Copy and paste the full job posting)</span>
                  </label>
                  <textarea
                    onChange={(e)=>setJobDescription(e.target.value)}
                    value={jobDescription}
                    placeholder='Paste the complete job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and AWS. You will lead the development of our SaaS platform...'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none'
                    rows={12}
                    required
                  />
                  <p className='text-xs text-slate-500 mt-2'>
                    💡 Tip: Include requirements, responsibilities, and qualifications for best results
                  </p>
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type="submit"
                  disabled={isLoading}
                  className='flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                >
                  {isLoading ? (
                    <>
                      <LoaderCircleIcon className='animate-spin size-5'/>
                      <span>Creating Tailored Resume...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className='size-5'/>
                      <span>Generate Tailored Resume</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={()=> {setShowJobDescriptionModal(false); setTitle(''); setJobDescription('')}}
                  className='px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors'
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>

              <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=> {setShowJobDescriptionModal(false); setTitle(''); setJobDescription('')}}/>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}

export default Dashboard
