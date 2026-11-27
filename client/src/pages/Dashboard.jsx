import { FilePenLineIcon, LoaderCircleIcon, CheckIcon, ArrowRightIcon, PencilIcon, PlusIcon, TrashIcon, UploadCloud, UploadCloudIcon, XIcon, SparklesIcon, BriefcaseIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'
import SEO from '../components/SEO'
import TailorProgress from '../components/TailorProgress'
import { streamTailorResume } from '../utils/tailorStream'
import { TONES, WRITING_STYLES } from '../configs/aiPreferences'
import { usePostHog } from 'posthog-js/react'

const Dashboard = () => {

  const {user, token} = useSelector(state => state.auth)

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"]
  const [allResumes, setAllResumes] = useState([])
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [showJobDescriptionModal, setShowJobDescriptionModal] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [hasDefaultResumeData, setHasDefaultResumeData] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAllResumes, setShowAllResumes] = useState(false)
  // Writing style / tone for the next tailored resume; starts from the saved AI Preferences
  const [tailorPreferences, setTailorPreferences] = useState({ writing_style: 'professional', tone: 'confident' })
  const [tailorStage, setTailorStage] = useState(null) // current progress stage while tailoring
  const [tailorRetrying, setTailorRetrying] = useState(false)
  // Guided first-run flow: 'upload' (step 1) -> 'job' (step 2) -> tailored resume opens in the builder (step 3)
  const [onboardingStep, setOnboardingStep] = useState('upload')
  const [onboardingFile, setOnboardingFile] = useState(null)

  const navigate = useNavigate()
  const posthog = usePostHog()

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
      const savedPreferences = data.defaultResumeData?.preferences
      if (savedPreferences) {
        setTailorPreferences({
          writing_style: savedPreferences.writing_style || 'professional',
          tone: savedPreferences.tone || 'confident',
        })
      }
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

  // Step 1 of onboarding: read the PDF into the profile, then go straight to pasting a job
  const uploadOnboardingResume = async (file) => {
    if (!file) return
    setOnboardingFile(file)
    setIsLoading(true)
    try {
      const resumeText = await pdfToText(file)
      await api.post('/api/ai/upload-resume-to-profile', {resumeText}, {headers: { Authorization: token }})
      setHasDefaultResumeData(true)
      posthog?.capture('onboarding_resume_uploaded')
      setOnboardingStep('job')
    } catch (error) {
      setOnboardingFile(null)
      toast.error(error?.response?.data?.message || "We couldn't read that PDF. Try another file or enter your details instead.")
    }
    setIsLoading(false)
  }

  const finishOnboardingLater = (path) => {
    posthog?.capture('onboarding_skipped', { at_step: onboardingStep })
    setShowOnboarding(false)
    if (path) navigate(path)
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
    setTailorStage('profile')
    setTailorRetrying(false)
    try {
      // Stream the job description to the AI endpoint so each step can be shown as it happens
      const resumeId = await streamTailorResume({
        token,
        jobDescription,
        title,
        preferences: tailorPreferences,
        onProgress: (stage) => {
          if (stage === 'retrying') setTailorRetrying(true)
          else setTailorStage(stage)
        },
      })

      posthog?.capture('tailored_resume_generated', { from_onboarding: showOnboarding })
      toast.success('Resume tailored successfully!')
      setShowOnboarding(false)
      setJobDescription('')
      setTitle('')
      setShowJobDescriptionModal(false)

      // Navigate to resume builder with the newly created resume
      navigate(`/app/builder/${resumeId}`)
    } catch (error) {
      toast.error(error.message)
    }
    setTailorStage(null)
    setIsLoading(false)
  }

  useEffect(()=>{
    checkDefaultResumeData()
    loadAllResumes()
    // Coming back from filling in the profile during onboarding: open "Paste a job" right away
    if (new URLSearchParams(window.location.search).get('next') === 'tailor') {
      setShowJobDescriptionModal(true)
      navigate('/app', { replace: true })
    }
  },[])

  return (
    <>
      <SEO
        title="Dashboard - Flower Resume | Create Unlimited Free Resumes"
        description="Create, edit, and manage unlimited resumes for free. Paste job descriptions, let AI tailor your resume, and download as PDF — no limits."
        keywords="free resume dashboard, create unlimited resumes, manage resumes free, AI resume creator, paste JD create resume, free PDF resume download"
        ogUrl="https://app.flower-resume.com/app"
      />
      <div className='max-w-7xl mx-auto px-4 py-8'>

        <p className='text-xl sm:text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>Welcome, {user?.name}</p>

        {/* AI-Powered Job Description Feature - Main Feature */}
        <div className='bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6 mb-6 shadow-sm'>
          <div className='flex flex-col sm:flex-row items-start gap-4'>
            <div className='p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg'>
              <SparklesIcon className='size-6 sm:size-8 text-white' />
            </div>
            <div className='flex-1'>
              <h2 className='text-lg sm:text-xl font-bold text-slate-800 mb-2 flex flex-col sm:flex-row sm:items-center gap-2'>
                <span>AI-Tailored Resume Creator</span>
                <span className='text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full w-fit'>NEW</span>
              </h2>
              <p className='text-sm sm:text-base text-slate-600 mb-4'>
                Paste a job description and our AI will create a perfectly tailored resume using your profile data. Highlighting the most relevant skills and experience for the role.
              </p>
              <button
                onClick={() => setShowJobDescriptionModal(true)}
                className='flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all active:scale-95 shadow-md hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto'
              >
                <BriefcaseIcon className='size-5' />
                Create AI-Tailored Resume
              </button>
            </div>
          </div>
        </div>

        {/* Hidden - Create manually options */}
        {/* <p className='text-sm font-medium text-slate-500 mb-3'>Or create manually:</p>
        <div className='flex gap-4 '>
            <button onClick={()=> setShowCreateResume(true)} className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <PlusIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500  text-white rounded-full'/>
              <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>Create Blank</p>
            </button>
            <button onClick={()=> setShowUploadResume(true)} className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <UploadCloudIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500  text-white rounded-full'/>
              <p className='text-sm group-hover:text-purple-600 transition-all duration-300'>Upload PDF</p>
            </button>
        </div> */}

      <hr className='border-slate-300 my-8' />

      {/* Saved Resumes Section */}
      <div className='mb-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
          <div>
            <h2 className='text-2xl font-bold text-slate-800'>My Resumes</h2>
            <p className='text-sm text-slate-500 mt-1'>
              {allResumes.length} {allResumes.length === 1 ? 'resume' : 'resumes'} saved
            </p>
          </div>
          <button
            onClick={() => setShowUploadResume(true)}
            className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md text-sm'
          >
            <UploadCloudIcon className='size-4' />
            <span className='hidden sm:inline'>Upload PDF</span>
            <span className='sm:hidden'>Upload</span>
          </button>
        </div>
      </div>

      {allResumes.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 sm:py-16 px-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200'>
          <FilePenLineIcon className='size-12 sm:size-16 text-slate-300 mb-4' />
          <h3 className='text-base sm:text-lg font-semibold text-slate-700 mb-2'>No resumes yet</h3>
          <p className='text-xs sm:text-sm text-slate-500 text-center max-w-md mb-6'>
            Start by creating an AI-tailored resume using a job description.
          </p>
          <button
            onClick={() => setShowJobDescriptionModal(true)}
            className='flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all shadow-md text-sm'
          >
            <SparklesIcon className='size-5' />
            Create AI-Tailored Resume
          </button>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
          {(showAllResumes ? allResumes : allResumes.slice(0, 7)).map((resume, index)=>{
          const baseColor = colors[index % colors.length];
          return (
            <button key={index} onClick={()=> navigate(`/app/builder/${resume._id}`)} className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer' style={{background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`, borderColor: baseColor + '40'}}>

              <FilePenLineIcon className="size-7 group-hover:scale-105 transition-all " style={{ color: baseColor }}/>
              <p className='text-sm group-hover:scale-105 transition-all  px-2 text-center' style={{ color: baseColor }}>{resume.title}</p>
              <p className='absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center' style={{ color: baseColor + '90' }}>
                 Updated on {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
              <div onClick={e=> e.stopPropagation()} className='absolute top-1 right-1 flex lg:hidden lg:group-hover:flex items-center'>
                <TrashIcon onClick={()=>deleteResume(resume._id)} className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"/>
                <PencilIcon onClick={()=> {setEditResumeId(resume._id); setTitle(resume.title)}} className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"/>
              </div>
            </button>
          )
        })}
        </div>

        {/* Show All / Show Less Button */}
        {allResumes.length > 7 && (
          <div className='flex justify-center mt-6'>
            <button
              onClick={() => setShowAllResumes(!showAllResumes)}
              className='flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all font-medium'
            >
              {showAllResumes ? (
                <>
                  <ChevronLeft className='size-5' />
                  Show Less
                </>
              ) : (
                <>
                  Show All Resumes ({allResumes.length})
                  <ChevronRight className='size-5' />
                </>
              )}
            </button>
          </div>
        )}
        </>
      )}

        {showUploadResume && (
          <form onSubmit={uploadResume} onClick={()=> setShowUploadResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center p-4'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
              <h2 className='text-lg sm:text-xl font-bold mb-4'>{hasDefaultResumeData === false ? 'Upload Resume to Profile' : 'Upload Resume'}</h2>
              {hasDefaultResumeData !== false && (
                <input onChange={(e)=>setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-yellow-600 ring-yellow-600 text-sm sm:text-base' required/>
              )}
                <div>
                  <label htmlFor="resume-input" className="block text-sm text-slate-700">
                    Select resume file
                    <div className='flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-yellow-500 hover:text-yellow-700 cursor-pointer transition-colors'>
                      {resume ? (
                        <p className='text-yellow-700 text-sm text-center break-all px-2'>{resume.name}</p>
                      ) : (
                        <>
                          <UploadCloud className='size-12 sm:size-14 stroke-1'/>
                          <p className='text-sm'>Upload resume</p>
                        </>
                      )}
                    </div>
                  </label>
                  <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e)=> setResume(e.target.files[0])}/>
                </div>
              <button disabled={isLoading} className='w-full py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base'>
                {isLoading && <LoaderCircleIcon className='animate-spin size-4 text-white'/>}
                {isLoading ? 'Uploading...' : 'Upload Resume'}

                </button>
              <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=> {setShowUploadResume(false); setTitle('')}}/>
            </div>
          </form>
        )
        }

        {editResumeId && (
          <form onSubmit={editTitle} onClick={()=> setEditResumeId('')} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center p-4'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
              <h2 className='text-lg sm:text-xl font-bold mb-4'>Edit Resume Title</h2>
              <input onChange={(e)=>setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-yellow-600 ring-yellow-600 text-sm sm:text-base' required/>

              <button className='w-full py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm sm:text-base'>Update</button>
              <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=> {setEditResumeId(''); setTitle('')}}/>
            </div>
          </form>
        )
        }

        {/* Onboarding: 3 guided steps ending on a finished, tailored resume */}
        {showOnboarding && (hasDefaultResumeData === false || onboardingStep === 'job') && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='relative bg-white rounded-2xl w-full max-w-2xl p-5 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto'>

              {/* Step indicator */}
              <ol className='flex items-center justify-center gap-2 sm:gap-3 mb-6 text-xs sm:text-sm'>
                {['Add your resume', 'Paste a job', 'Get your resume'].map((label, index) => {
                  const current = onboardingStep === 'upload' ? 0 : (tailorStage ? 2 : 1)
                  const done = index < current
                  const active = index === current
                  return (
                    <li key={label} className='flex items-center gap-2'>
                      <span className={`size-6 rounded-full flex items-center justify-center font-semibold shrink-0 ${done ? 'bg-green-500 text-white' : active ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {done ? <CheckIcon className='size-3.5' /> : index + 1}
                      </span>
                      <span className={`${active ? 'text-slate-800 font-medium' : 'text-slate-500'} hidden sm:inline`}>{label}</span>
                      {index < 2 && <span className='w-4 sm:w-8 h-px bg-slate-300' />}
                    </li>
                  )
                })}
              </ol>

              {onboardingStep === 'upload' ? (
                <>
                  <div className='text-center mb-6'>
                    <span className='text-4xl'>🌻</span>
                    <h2 className='text-2xl sm:text-3xl font-bold text-slate-800 mt-2 mb-2'>
                      Welcome{user?.name && !/guest/i.test(user.name) ? `, ${user.name.split(' ')[0]}` : ''}!
                    </h2>
                    <p className='text-sm sm:text-base text-slate-600 max-w-lg mx-auto'>
                      Get a resume tailored to the job you want in about 2 minutes. Start by adding your current resume.
                    </p>
                  </div>

                  <label htmlFor='onboarding-resume' className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 sm:p-10 transition-colors ${isLoading ? 'border-amber-300 bg-amber-50 cursor-wait' : 'border-slate-300 hover:border-amber-500 hover:bg-amber-50 cursor-pointer'}`}>
                    {isLoading ? (
                      <>
                        <LoaderCircleIcon className='size-10 text-amber-600 animate-spin' />
                        <p className='text-sm font-medium text-slate-700'>Reading {onboardingFile?.name || 'your resume'}…</p>
                        <p className='text-xs text-slate-500'>Pulling out your experience, education and skills</p>
                      </>
                    ) : (
                      <>
                        <UploadCloudIcon className='size-12 text-amber-500 stroke-[1.5]' />
                        <p className='text-sm sm:text-base font-medium text-slate-700'>Click to upload your resume (PDF)</p>
                        <p className='text-xs text-slate-500'>We'll fill in your profile for you — no typing needed</p>
                      </>
                    )}
                  </label>
                  <input type='file' id='onboarding-resume' accept='.pdf' hidden disabled={isLoading} onChange={(e) => { uploadOnboardingResume(e.target.files[0]); e.target.value = '' }} />

                  <div className='text-center mt-5 text-sm text-slate-500'>
                    No resume yet?{' '}
                    <button type='button' disabled={isLoading} onClick={() => finishOnboardingLater('/app/profile?onboarding=true')} className='text-amber-700 font-medium hover:underline'>
                      Enter your details instead
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={createTailoredResume}>
                  {!tailorStage && (
                    <div className='flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3 mb-5'>
                      <CheckIcon className='size-5 text-green-600 shrink-0 mt-0.5' />
                      <p className='text-sm text-green-900'>
                        <span className='font-medium'>Your profile is ready.</span> Now paste a job you want to apply for and we'll write a resume for it.
                      </p>
                    </div>
                  )}

                  {tailorStage && <TailorProgress stage={tailorStage} retrying={tailorRetrying} />}

                  <div className={`space-y-4 ${tailorStage ? 'hidden' : ''}`}>
                    <div>
                      <label htmlFor='onboarding-title' className='block text-sm font-medium text-slate-700 mb-1'>Job title</label>
                      <input id='onboarding-title' onChange={(e)=>setTitle(e.target.value)} value={title} type='text' placeholder='e.g., Marketing Manager at Spotify' className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base' required />
                    </div>
                    <div>
                      <label htmlFor='onboarding-jd' className='block text-sm font-medium text-slate-700 mb-1'>
                        Job description <span className='text-slate-500 font-normal'>(copy and paste the job post)</span>
                      </label>
                      <textarea id='onboarding-jd' onChange={(e)=>setJobDescription(e.target.value)} value={jobDescription} rows={8} placeholder='Paste the full job post here — responsibilities, requirements, qualifications...' className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm sm:text-base' required />
                    </div>
                  </div>

                  <button type='submit' disabled={isLoading} className='mt-5 w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium'>
                    {isLoading ? <><LoaderCircleIcon className='animate-spin size-5'/> Creating your resume…</> : <><SparklesIcon className='size-5'/> Create my tailored resume <ArrowRightIcon className='size-4'/></>}
                  </button>

                  {!isLoading && (
                    <div className='flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 mt-4 text-sm text-center'>
                      <button type='button' onClick={() => finishOnboardingLater('/app/profile?onboarding=true')} className='text-slate-500 hover:text-slate-700 hover:underline'>Check my profile first</button>
                      <button type='button' onClick={() => finishOnboardingLater()} className='text-slate-500 hover:text-slate-700 hover:underline'>I'll do this later</button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        )}

        {/* Job Description Modal - AI Tailored Resume */}
        {showJobDescriptionModal && (
          <form onSubmit={createTailoredResume} onClick={()=> { if (!isLoading) setShowJobDescriptionModal(false) }} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center p-4'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto'>
              <div className='flex items-center gap-2 sm:gap-3 mb-4'>
                <div className='p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex-shrink-0'>
                  <SparklesIcon className='size-5 sm:size-6 text-white' />
                </div>
                <h2 className='text-lg sm:text-2xl font-bold text-slate-800'>Create AI-Tailored Resume</h2>
              </div>

              <p className='text-sm sm:text-base text-slate-600 mb-4'>
                Our AI will analyze the job description and create a resume highlighting your most relevant experience and skills from your profile.
              </p>

              {tailorStage && <TailorProgress stage={tailorStage} retrying={tailorRetrying} />}

              <div className={`space-y-4 ${tailorStage ? 'hidden' : ''}`}>
                <div>
                  <label className='block text-xs sm:text-sm font-medium text-slate-700 mb-2'>
                    Resume Title
                  </label>
                  <input
                    onChange={(e)=>setTitle(e.target.value)}
                    value={title}
                    type="text"
                    placeholder='e.g., Senior Software Engineer at Google'
                    className='w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs sm:text-sm font-medium text-slate-700 mb-2'>
                    Job Description
                    <span className='text-slate-500 text-xs ml-2 hidden sm:inline'>(Copy and paste the full job posting)</span>
                  </label>
                  <textarea
                    onChange={(e)=>setJobDescription(e.target.value)}
                    value={jobDescription}
                    placeholder='Paste the complete job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and AWS. You will lead the development of our SaaS platform...'
                    className='w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm sm:text-base'
                    rows={10}
                    required
                  />
                  <p className='text-xs text-slate-500 mt-2'>
                    💡 Tip: Include requirements, responsibilities, and qualifications for best results
                  </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label htmlFor='tailor-style' className='block text-xs sm:text-sm font-medium text-slate-700 mb-1'>Writing style</label>
                    <select
                      id='tailor-style'
                      value={tailorPreferences.writing_style}
                      onChange={(e) => setTailorPreferences(prev => ({ ...prev, writing_style: e.target.value }))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                    >
                      {WRITING_STYLES.map(style => <option key={style.id} value={style.id}>{style.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor='tailor-tone' className='block text-xs sm:text-sm font-medium text-slate-700 mb-1'>Tone</label>
                    <select
                      id='tailor-tone'
                      value={tailorPreferences.tone}
                      onChange={(e) => setTailorPreferences(prev => ({ ...prev, tone: e.target.value }))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                    >
                      {TONES.map(tone => <option key={tone.id} value={tone.id}>{tone.label}</option>)}
                    </select>
                  </div>
                  <p className='sm:col-span-2 text-xs text-slate-500'>
                    Applies to this resume only. Change your defaults in{' '}
                    <button type='button' onClick={() => navigate('/app/profile?tab=preferences')} className='text-amber-700 hover:underline'>Profile → AI Preferences</button>.
                  </p>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-3 mt-6'>
                <button
                  type="submit"
                  disabled={isLoading}
                  className='flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base'
                >
                  {isLoading ? (
                    <>
                      <LoaderCircleIcon className='animate-spin size-4 sm:size-5'/>
                      <span className="hidden sm:inline">Creating Tailored Resume...</span>
                      <span className="sm:hidden">Creating...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className='size-4 sm:size-5'/>
                      <span className="hidden sm:inline">Generate Tailored Resume</span>
                      <span className="sm:hidden">Generate Resume</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={()=> {setShowJobDescriptionModal(false); setTitle(''); setJobDescription('')}}
                  className='px-6 py-2.5 sm:py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm sm:text-base'
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>

              {!isLoading && <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=> {setShowJobDescriptionModal(false); setTitle(''); setJobDescription('')}}/>}
            </div>
          </form>
        )}

      </div>
    </>
  )
}

export default Dashboard
