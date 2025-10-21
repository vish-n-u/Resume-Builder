import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import { ArrowLeftIcon, Award, Briefcase, ChevronLeft, ChevronRight, CopyIcon, DatabaseIcon, DownloadIcon, EyeIcon, EyeOffIcon, FileText, FolderIcon, GraduationCap, Share2Icon, Sparkles, Trophy, User } from 'lucide-react'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm'
import ExperienceForm from '../components/ExperienceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillsForm from '../components/SkillsForm'
import CertificationsForm from '../components/CertificationsForm'
import AchievementsForm from '../components/AchievementsForm'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'

const ResumeBuilder = () => {

  const { resumeId } = useParams()
  const {token} = useSelector(state => state.auth)

  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    job_description: '',
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    certifications: [],
    achievements: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
    sectionVisibility: {
      summary: true,
      experience: true,
      education: true,
      projects: true,
      skills: true,
      certifications: true,
      achievements: true,
    }
  })

  const loadExistingResume = async () => {
   try {
    const {data} = await api.get('/api/resumes/get/' + resumeId, {headers: { Authorization: token }})
    if(data.resume){
      // Ensure sectionVisibility exists with default values
      const loadedResume = {
        ...data.resume,
        sectionVisibility: data.resume.sectionVisibility || {
          summary: true,
          experience: true,
          education: true,
          projects: true,
          skills: true,
          certifications: true,
          achievements: true,
        }
      }
      setResumeData(loadedResume)
      document.title = data.resume.title;
    }
   } catch (error) {
    console.log(error.message)
   }
  }

  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [showProfileData, setShowProfileData] = useState(false)
  const [defaultResumeData, setDefaultResumeData] = useState(null)

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
    { id: "certifications", name: "Certifications", icon: Award },
    { id: "achievements", name: "Achievements", icon: Trophy },
  ]

  const activeSection = sections[activeSectionIndex]

  const toggleSectionVisibility = (sectionId) => {
    setResumeData(prev => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [sectionId]: !prev.sectionVisibility[sectionId]
      }
    }))
  }

  const loadDefaultResumeData = async () => {
    try {
      const { data } = await api.get('/api/users/default-resume-data', {headers: { Authorization: token }})
      if (data.defaultResumeData && Object.keys(data.defaultResumeData).length > 0) {
        setDefaultResumeData(data.defaultResumeData)
      }
    } catch (error) {
      console.error('Error loading default resume data:', error)
    }
  }

  useEffect(()=>{
    loadExistingResume()
    loadDefaultResumeData()
  },[])

  const changeResumeVisibility = async () => {
    try {
       const formData = new FormData()
       formData.append("resumeId", resumeId)
       formData.append("resumeData", JSON.stringify({public: !resumeData.public}))

       const {data} = await api.put('/api/resumes/update', formData, {headers: { Authorization: token }})

       setResumeData({...resumeData, public: !resumeData.public})
       toast.success(data.message)
    } catch (error) {
      console.error("Error saving resume:", error)
    }
  }

  const handleShare = () =>{
    const frontendUrl = window.location.href.split('/app/')[0];
    const resumeUrl = frontendUrl + '/view/' + resumeId;

    if(navigator.share){
      navigator.share({url: resumeUrl, text: "My Resume", })
    }else{
      alert('Share not supported on this browser.')
    }
  }

  const downloadResume = () => {
    window.print();
  }


const saveResume = async () => {
  try {
    let updatedResumeData = structuredClone(resumeData)

    // remove image from updatedResumeData
    if(typeof resumeData.personal_info.image === 'object'){
      delete updatedResumeData.personal_info.image
    }

    const formData = new FormData();
    formData.append("resumeId", resumeId)
    formData.append('resumeData', JSON.stringify(updatedResumeData))
    removeBackground && formData.append("removeBackground", "yes");
    typeof resumeData.personal_info.image === 'object' && formData.append("image", resumeData.personal_info.image)

    const { data } = await api.put('/api/resumes/update', formData, {headers: { Authorization: token }})

    setResumeData(data.resume)
    toast.success(data.message)
  } catch (error) {
    console.error("Error saving resume:", error)
  }
}

  return (
    <div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link to={'/app'} className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all'>
          <ArrowLeftIcon className="size-4"/> Back to Dashboard
        </Link>
      </div>

      <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Left Panel - Form */}
          <div className='relative lg:col-span-5 rounded-lg overflow-hidden'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              {/* progress bar using activeSectionIndex */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200"/>
              <hr className="absolute top-0 left-0  h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000" style={{width: `${activeSectionIndex * 100 / (sections.length - 1)}%`}}/>

              {/* Section Navigation */}
              <div className="flex justify-between items-center mb-6 border-b border-gray-300 py-1">

                <div className='flex items-center gap-2'>
                  <TemplateSelector selectedTemplate={resumeData.template} onChange={(template)=> setResumeData(prev => ({...prev, template}))}/>
                  <ColorPicker selectedColor={resumeData.accent_color} onChange={(color)=>setResumeData(prev => ({...prev, accent_color: color}))}/>
                </div>

                <div className='flex items-center'>
                  {activeSectionIndex !== 0 && (
                    <button onClick={()=> setActiveSectionIndex((prevIndex)=> Math.max(prevIndex - 1, 0))} className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all' disabled={activeSectionIndex === 0}>
                      <ChevronLeft className="size-4"/> Previous
                    </button>
                  )}
                  <button onClick={()=> setActiveSectionIndex((prevIndex)=> Math.min(prevIndex + 1, sections.length - 1))} className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && 'opacity-50'}`} disabled={activeSectionIndex === sections.length - 1}>
                      Next <ChevronRight className="size-4"/>
                    </button>
                </div>
              </div>

              {/* Form Content */}
              <div className='space-y-6'>
                  {activeSection.id === 'personal' && (
                    <PersonalInfoForm data={resumeData.personal_info} onChange={(data)=>setResumeData(prev => ({...prev, personal_info: data }))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />
                  )}
                  {activeSection.id === 'summary' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Professional Summary</h3>
                        <button
                          onClick={() => toggleSectionVisibility('summary')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility.summary ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility.summary ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility.summary ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(data)=> setResumeData(prev=> ({...prev, professional_summary: data}))} setResumeData={setResumeData}/>
                    </div>
                  )}
                  {activeSection.id === 'experience' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Experience</h3>
                        <button
                          onClick={() => toggleSectionVisibility('experience')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility.experience ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility.experience ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility.experience ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <ExperienceForm data={resumeData.experience} onChange={(data)=> setResumeData(prev=> ({...prev, experience: data}))} jobDescription={resumeData.job_description}/>
                    </div>
                  )}
                  {activeSection.id === 'education' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Education</h3>
                        <button
                          onClick={() => toggleSectionVisibility('education')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility.education ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility.education ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility.education ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <EducationForm data={resumeData.education} onChange={(data)=> setResumeData(prev=> ({...prev, education: data}))}/>
                    </div>
                  )}
                  {activeSection.id === 'projects' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Projects</h3>
                        <button
                          onClick={() => toggleSectionVisibility('projects')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility.projects ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility.projects ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility.projects ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <ProjectForm data={resumeData.project} onChange={(data)=> setResumeData(prev=> ({...prev, project: data}))}/>
                    </div>
                  )}
                  {activeSection.id === 'skills' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Skills</h3>
                        <button
                          onClick={() => toggleSectionVisibility('skills')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility.skills ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility.skills ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility.skills ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <SkillsForm data={resumeData.skills} onChange={(data)=> setResumeData(prev=> ({...prev, skills: data}))}/>
                    </div>
                  )}
                  {activeSection.id === 'certifications' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Certifications</h3>
                        <button
                          onClick={() => toggleSectionVisibility('certifications')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility.certifications ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility.certifications ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility.certifications ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <CertificationsForm data={resumeData.certifications} onChange={(data)=> setResumeData(prev=> ({...prev, certifications: data}))}/>
                    </div>
                  )}
                  {activeSection.id === 'achievements' && (
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>Achievements</h3>
                        <button
                          onClick={() => toggleSectionVisibility('achievements')}
                          className={`p-2 rounded-lg transition-colors ${resumeData.sectionVisibility.achievements ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={resumeData.sectionVisibility.achievements ? 'Hide in preview' : 'Show in preview'}
                        >
                          {resumeData.sectionVisibility.achievements ? <EyeIcon className="size-5"/> : <EyeOffIcon className="size-5"/>}
                        </button>
                      </div>
                      <AchievementsForm data={resumeData.achievements} onChange={(data)=> setResumeData(prev=> ({...prev, achievements: data}))}/>
                    </div>
                  )}

              </div>
              {/* <button onClick={()=> {toast.promise(saveResume, {loading: 'Saving...'})}} className='bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm'>
                Save Changes
              </button> */}
            </div>
          </div>

          {/* Right Panel - Preview / Profile Data */}
          <div className='lg:col-span-7 max-lg:mt-6'>
              <div className='relative w-full'>
                <div className='absolute bottom-3 left-0 right-0 flex items-center justify-between gap-2'>
                    <button
                      onClick={() => setShowProfileData(!showProfileData)}
                      className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg transition-all ${
                        showProfileData
                          ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-md'
                          : 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 ring-yellow-300 hover:ring'
                      }`}
                    >
                      <DatabaseIcon className='size-4'/>
                      {showProfileData ? 'Show Resume Preview' : 'Show My Profile Data'}
                    </button>
                    <div className='flex gap-2'>
                    {resumeData.public && (
                      <button onClick={handleShare} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors'>
                        <Share2Icon className='size-4'/> Share
                      </button>
                    )}
                    {/* <button onClick={changeResumeVisibility} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors'>
                      {resumeData.public ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                      {resumeData.public ? 'Public' : 'Private'}
                    </button> */}
                    <button onClick={downloadResume} className='flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
                      <DownloadIcon className='size-4'/> Download
                    </button>
                    </div>
                </div>
              </div>

              {/* Toggle between Resume Preview and Profile Data */}
              {!showProfileData ? (
                <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color}/>
              ) : (
                <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-6'>
                  <div className='mb-6'>
                    <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
                      <DatabaseIcon className='size-7 text-yellow-600'/>
                      My Profile Data
                    </h2>
                    <p className='text-gray-600 text-sm mt-2'>Reference and copy content from your stored profile to use in your resume</p>
                  </div>

                  {!defaultResumeData ? (
                    <div className='text-center py-12'>
                      <DatabaseIcon className='size-16 mx-auto text-gray-300 mb-4'/>
                      <p className='text-gray-500 text-lg'>No profile data found</p>
                      <Link to='/app/profile' className='text-yellow-600 hover:underline mt-2 inline-block'>
                        Go to Profile to add your data
                      </Link>
                    </div>
                  ) : (
                    <div className='space-y-6'>
                      {/* Professional Summary */}
                      {defaultResumeData.professional_summary && (
                        <DataSection
                          title="Professional Summary"
                          icon={FileText}
                          content={defaultResumeData.professional_summary}
                        />
                      )}

                      {/* Skills */}
                      {defaultResumeData.skills && defaultResumeData.skills.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-3'>
                            <Sparkles className='size-5 text-yellow-600'/>
                            Skills
                          </h3>
                          <div className='flex flex-wrap gap-2'>
                            {defaultResumeData.skills.map((skill, index) => (
                              <CopyableChip key={index} text={skill} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {defaultResumeData.experience && defaultResumeData.experience.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <Briefcase className='size-5 text-yellow-600'/>
                            Experience
                          </h3>
                          <div className='space-y-4'>
                            {defaultResumeData.experience.map((exp, index) => (
                              <ExperienceCard key={index} experience={exp} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {defaultResumeData.education && defaultResumeData.education.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <GraduationCap className='size-5 text-yellow-600'/>
                            Education
                          </h3>
                          <div className='space-y-4'>
                            {defaultResumeData.education.map((edu, index) => (
                              <EducationCard key={index} education={edu} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {defaultResumeData.project && defaultResumeData.project.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <FolderIcon className='size-5 text-yellow-600'/>
                            Projects
                          </h3>
                          <div className='space-y-4'>
                            {defaultResumeData.project.map((proj, index) => (
                              <ProjectCard key={index} project={proj} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {defaultResumeData.certifications && defaultResumeData.certifications.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <Award className='size-5 text-yellow-600'/>
                            Certifications
                          </h3>
                          <div className='space-y-3'>
                            {defaultResumeData.certifications.map((cert, index) => (
                              <CertificationCard key={index} certification={cert} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Achievements */}
                      {defaultResumeData.achievements && defaultResumeData.achievements.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
                          <h3 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                            <Trophy className='size-5 text-yellow-600'/>
                            Achievements
                          </h3>
                          <div className='space-y-3'>
                            {defaultResumeData.achievements.map((ach, index) => (
                              <AchievementCard key={index} achievement={ach} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

    </div>
  )
}

// Helper Components for Drawer
const DataSection = ({ title, icon: Icon, content }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className='bg-gray-50 rounded-lg p-5 border border-gray-200'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
          <Icon className='size-5 text-yellow-600'/>
          {title}
        </h3>
        <button
          onClick={handleCopy}
          className='flex items-center gap-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md text-xs transition-colors'
        >
          <CopyIcon className='size-3'/>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className='text-gray-700 text-sm leading-relaxed' dangerouslySetInnerHTML={{ __html: content }} />
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
      className='px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full text-sm transition-colors flex items-center gap-1'
    >
      {text}
      {copied && <CopyIcon className='size-3'/>}
    </button>
  )
}

const ExperienceCard = ({ experience }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(experience.description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Description copied!')
  }

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
        <button
          onClick={handleCopy}
          className='flex items-center gap-1 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-xs transition-colors'
        >
          <CopyIcon className='size-3'/>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className='text-sm text-gray-700 mt-2' dangerouslySetInnerHTML={{ __html: experience.description }} />
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
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(project.description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Description copied!')
  }

  return (
    <div className='bg-white p-4 rounded-lg border border-gray-200'>
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-semibold text-gray-800'>{project.name}</h4>
          {project.type && <p className='text-sm text-gray-600'>{project.type}</p>}
        </div>
        <button
          onClick={handleCopy}
          className='flex items-center gap-1 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-xs transition-colors'
        >
          <CopyIcon className='size-3'/>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className='text-sm text-gray-700 mt-2' dangerouslySetInnerHTML={{ __html: project.description }} />
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
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(achievement.description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Description copied!')
  }

  return (
    <div className='bg-white p-3 rounded-lg border border-gray-200'>
      <div className='flex justify-between items-start'>
        <h4 className='font-semibold text-gray-800 text-sm'>{achievement.title}</h4>
        <button
          onClick={handleCopy}
          className='flex items-center gap-1 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-xs transition-colors'
        >
          <CopyIcon className='size-3'/>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className='text-sm text-gray-700 mt-1' dangerouslySetInnerHTML={{ __html: achievement.description }} />
    </div>
  )
}

export default ResumeBuilder
