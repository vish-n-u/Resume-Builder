import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, UserIcon, SaveIcon, Briefcase, GraduationCap, FolderIcon, Sparkles, FileTextIcon, PlusIcon, TrashIcon, Award, Trophy, Settings } from 'lucide-react'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { login } from '../app/features/authSlice'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm'
import ExperienceForm from '../components/ExperienceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillsForm from '../components/SkillsForm'
import CertificationsForm from '../components/CertificationsForm'
import AchievementsForm from '../components/AchievementsForm'
import CustomSectionsForm from '../components/CustomSectionsForm'

const UserProfile = () => {

  const { user, token } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  // Check if coming from onboarding (set resume-data as default tab)
  const params = new URLSearchParams(window.location.search)
  const fromOnboarding = params.get('onboarding') === 'true'

  const [activeTab, setActiveTab] = useState(fromOnboarding ? 'resume-data' : 'account') // account, resume-data, preferences
  const [isLoading, setIsLoading] = useState(false)

  // Account fields
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Default Resume Data fields
  const [defaultResumeData, setDefaultResumeData] = useState({
    professional_summary: '',
    skills: [],
    personal_info: {
      image: '',
      full_name: '',
      profession: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
    },
    experience: [],
    project: [],
    education: [],
    certifications: [],
    achievements: [],
    custom_sections: [],
    preferences: {
      writing_style: 'professional',
      tone: 'confident',
      custom_requirements: ''
    }
  })

  const [removeBackground, setRemoveBackground] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Load user's default resume data
  useEffect(() => {
    const loadDefaultResumeData = async () => {
      try {
        setIsDataLoading(true)
        const { data } = await api.get('/api/users/default-resume-data', { headers: { Authorization: token } })

        if (data.defaultResumeData && Object.keys(data.defaultResumeData).length > 0) {
          // Merge with default structure to ensure all fields exist
          setDefaultResumeData({
            professional_summary: data.defaultResumeData.professional_summary || '',
            skills: data.defaultResumeData.skills || [],
            personal_info: {
              image: data.defaultResumeData.personal_info?.image || '',
              full_name: data.defaultResumeData.personal_info?.full_name || '',
              profession: data.defaultResumeData.personal_info?.profession || '',
              email: data.defaultResumeData.personal_info?.email || '',
              phone: data.defaultResumeData.personal_info?.phone || '',
              location: data.defaultResumeData.personal_info?.location || '',
              linkedin: data.defaultResumeData.personal_info?.linkedin || '',
              website: data.defaultResumeData.personal_info?.website || '',
            },
            experience: data.defaultResumeData.experience || [],
            project: data.defaultResumeData.project || [],
            education: data.defaultResumeData.education || [],
            certifications: data.defaultResumeData.certifications || [],
            achievements: data.defaultResumeData.achievements || [],
            custom_sections: data.defaultResumeData.custom_sections || [],
            preferences: {
              writing_style: data.defaultResumeData.preferences?.writing_style || 'professional',
              tone: data.defaultResumeData.preferences?.tone || 'confident',
              custom_requirements: data.defaultResumeData.preferences?.custom_requirements || ''
            }
          })
        }
      } catch (error) {
        console.error('Error loading default resume data:', error)
        toast.error('Failed to load default resume data')
      } finally {
        setIsDataLoading(false)
      }
    }
    loadDefaultResumeData()
  }, [token])

  // Update account info
  const handleUpdateAccount = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data } = await api.put('/api/users/update', { name, email }, { headers: { Authorization: token } })
      dispatch(login({ token, user: data.user }))
      toast.success('Account updated successfully!')
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  // Save default resume data
  const handleSaveDefaultResumeData = async () => {
    setIsLoading(true)
    try {
      let updatedResumeData = structuredClone(defaultResumeData)

      // Check if image needs upload
      if (typeof defaultResumeData.personal_info.image === 'object') {
        delete updatedResumeData.personal_info.image
      }

      const formData = new FormData()
      formData.append('defaultResumeData', JSON.stringify(updatedResumeData))
      removeBackground && formData.append("removeBackground", "yes")
      typeof defaultResumeData.personal_info.image === 'object' && formData.append("image", defaultResumeData.personal_info.image)

      const { data } = await api.put('/api/users/update-default-resume-data', formData, { headers: { Authorization: token } })

      // Update local state with saved data (including image URL if uploaded)
      if (data.defaultResumeData) {
        setDefaultResumeData(data.defaultResumeData)
      }

      toast.success('Your resume data saved successfully!')
    } catch (error) {
      console.error('Error saving your resume data:', error)
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  const tabs = [
    { id: 'account', name: 'Account Info', icon: UserIcon },
    { id: 'resume-data', name: 'Your Resume Data', icon: FileTextIcon },
    { id: 'preferences', name: 'AI Preferences', icon: Settings },
  ]

  return (
    <div className='min-h-screen bg-gray-50 overflow-x-hidden'>
      <div className='max-w-6xl mx-auto px-4 py-6 sm:py-8'>

        {/* Back Button */}
        <Link to='/app' className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all mb-6 text-sm'>
          <ArrowLeftIcon className="size-4" /> Back to Dashboard
        </Link>

        {/* Page Title */}
        <h1 className='text-2xl sm:text-3xl font-bold text-slate-800 mb-2'>Profile Settings</h1>
        <p className='text-sm sm:text-base text-slate-600 mb-6 sm:mb-8'>Manage your account and set your resume information</p>

        {/* Tabs */}
        <div className='flex gap-1 sm:gap-2 mb-6 border-b border-gray-200 overflow-x-auto'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-6 py-3 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-yellow-600 border-b-2 border-yellow-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Icon className='size-4 sm:size-5' />
                <span className='max-sm:hidden text-sm sm:text-base'>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 overflow-x-hidden'>

          {/* Account Info Tab */}
          {activeTab === 'account' && (
            <div>
              <h2 className='text-xl sm:text-2xl font-semibold text-slate-800 mb-4 sm:mb-6'>Account Information</h2>
              <form onSubmit={handleUpdateAccount} className='space-y-4 max-w-2xl'>
                <div>
                  <label className='block text-xs sm:text-sm font-medium text-slate-700 mb-2'>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base'
                    required
                  />
                </div>
                <div>
                  <label className='block text-xs sm:text-sm font-medium text-slate-700 mb-2'>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base'
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className='bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Default Resume Data Tab */}
          {activeTab === 'resume-data' && (
            <div>
              <div className='mb-4 sm:mb-6'>
                <h2 className='text-xl sm:text-2xl font-semibold text-slate-800 mb-2'>Your Resume Data</h2>
                <p className='text-sm sm:text-base text-slate-600'>This information will be used to auto-fill new resumes you create</p>
              </div>

              {isDataLoading ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4'></div>
                    <p className='text-sm sm:text-base text-slate-600'>Loading your data...</p>
                  </div>
                </div>
              ) : (
              <>
              <div className='space-y-8 max-w-full overflow-x-hidden'>
                {/* Personal Info Section */}
                <div className='border-b border-gray-200 pb-8 max-w-full'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <UserIcon className='size-5 text-yellow-600' />
                    Personal Information
                  </h3>
                  <PersonalInfoForm
                    data={defaultResumeData.personal_info}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, personal_info: data }))}
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                  />
                </div>

                {/* Professional Summary Section */}
                <div className='border-b border-gray-200 pb-8 max-w-full'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <FileTextIcon className='size-5 text-yellow-600' />
                    Professional Summary
                  </h3>
                  <ProfessionalSummaryForm
                    data={defaultResumeData.professional_summary}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, professional_summary: data }))}
                    setResumeData={setDefaultResumeData}
                  />
                </div>

                {/* Skills Section */}
                <div className='border-b border-gray-200 pb-8 max-w-full'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <Sparkles className='size-5 text-yellow-600' />
                    Skills
                  </h3>
                  <SkillsForm
                    data={defaultResumeData.skills}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, skills: data }))}
                  />
                </div>

                {/* Experience Section */}
                <div className='border-b border-gray-200 pb-8 max-w-full'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <Briefcase className='size-5 text-yellow-600' />
                    Work Experience
                  </h3>
                  <ExperienceForm
                    data={defaultResumeData.experience}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, experience: data }))}
                  />
                </div>

                {/* Education Section */}
                <div className='border-b border-gray-200 pb-8 max-w-full'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <GraduationCap className='size-5 text-yellow-600' />
                    Education
                  </h3>
                  <EducationForm
                    data={defaultResumeData.education}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, education: data }))}
                  />
                </div>

                {/* Projects Section */}
                <div className='border-b border-gray-200 pb-8 max-w-full'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <FolderIcon className='size-5 text-yellow-600' />
                    Projects
                  </h3>
                  <ProjectForm
                    data={defaultResumeData.project}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, project: data }))}
                  />
                </div>

                {/* Certifications Section */}
                <div className='border-b border-gray-200 pb-8 max-w-full'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <Award className='size-5 text-yellow-600' />
                    Certifications
                  </h3>
                  <CertificationsForm
                    data={defaultResumeData.certifications}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, certifications: data }))}
                  />
                </div>

                {/* Achievements Section */}
                <div className='border-b border-gray-200 pb-8 max-w-full'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <Trophy className='size-5 text-yellow-600' />
                    Achievements
                  </h3>
                  <AchievementsForm
                    data={defaultResumeData.achievements}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, achievements: data }))}
                  />
                </div>

                {/* Custom Sections */}
                <div className='pb-8 max-w-full'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <FileTextIcon className='size-5 text-yellow-600' />
                    Custom Sections
                  </h3>
                  <CustomSectionsForm
                    data={defaultResumeData.custom_sections}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, custom_sections: data }))}
                  />
                </div>

                {/* Spacer for sticky button */}
                <div className='h-20'></div>
              </div>

              {/* Sticky Save Button */}
              <div className='fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50 px-4 py-4'>
                <div className='max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3'>
                  <p className='text-xs sm:text-sm text-slate-600 text-center sm:text-left'>
                    💡 Tip: Fill out your information here once, and it will automatically populate when you create new resumes!
                  </p>
                  <button
                    onClick={() => toast.promise(handleSaveDefaultResumeData(), { loading: 'Saving...' })}
                    disabled={isLoading}
                    className='flex items-center justify-center gap-2 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto shadow-lg flex-shrink-0'
                  >
                    <SaveIcon className='size-4 sm:size-5' />
                    <span className="hidden sm:inline">Save Your Resume Data</span>
                    <span className="sm:hidden">Save Data</span>
                  </button>
                </div>
              </div>
              </>
              )}
            </div>
          )}

          {/* AI Preferences Tab */}
          {activeTab === 'preferences' && (
            <div>
              <div className='mb-6'>
                <h2 className='text-xl sm:text-2xl font-semibold text-slate-800 mb-2'>AI Preferences</h2>
                <p className='text-sm sm:text-base text-slate-600'>
                  Customize how AI generates and tailors your resume content. These preferences will be used every time AI creates content for you.
                </p>
              </div>

              <div className='space-y-6 max-w-3xl'>
                {/* Writing Style */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-3'>
                    Writing Style
                  </label>
                  <div className='grid grid-cols-2 gap-3'>
                    {['professional', 'technical', 'creative', 'casual'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setDefaultResumeData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, writing_style: style }
                        }))}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          defaultResumeData.preferences.writing_style === style
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 hover:border-gray-300 text-slate-600'
                        }`}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className='text-xs text-slate-500 mt-2'>
                    {defaultResumeData.preferences.writing_style === 'professional' && 'Formal and business-oriented language'}
                    {defaultResumeData.preferences.writing_style === 'technical' && 'Technical jargon and specific terminology'}
                    {defaultResumeData.preferences.writing_style === 'creative' && 'Engaging and unique expressions'}
                    {defaultResumeData.preferences.writing_style === 'casual' && 'Conversational and approachable tone'}
                  </p>
                </div>

                {/* Tone */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-3'>
                    Tone
                  </label>
                  <div className='grid grid-cols-2 gap-3'>
                    {['confident', 'friendly', 'formal', 'enthusiastic'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDefaultResumeData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, tone: t }
                        }))}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          defaultResumeData.preferences.tone === t
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 hover:border-gray-300 text-slate-600'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Requirements */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Custom Requirements
                  </label>
                  <textarea
                    value={defaultResumeData.preferences.custom_requirements}
                    onChange={(e) => setDefaultResumeData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, custom_requirements: e.target.value }
                    }))}
                    placeholder="Any specific requirements or instructions for how AI should generate your resume content..."
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm'
                    rows={5}
                  />
                  <p className='text-xs text-slate-500 mt-1'>Provide any custom instructions to guide the AI when creating content</p>
                </div>

                {/* Info Box */}
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex items-start gap-3'>
                    <Sparkles className='size-5 text-blue-600 mt-0.5 flex-shrink-0' />
                    <div className='text-sm text-blue-800'>
                      <strong>How it works:</strong> These preferences guide the AI when generating or enhancing your resume content.
                      They apply to features like "Enhance with AI", "Tailor Resume", and custom prompts.
                    </div>
                  </div>
                </div>

                {/* Spacer for sticky button */}
                <div className='h-20'></div>
              </div>

              {/* Sticky Save Button */}
              <div className='fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50 px-4 py-4'>
                <div className='max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3'>
                  <p className='text-xs sm:text-sm text-slate-600 text-center sm:text-left'>
                    💡 Tip: These preferences will be applied whenever AI generates or enhances your resume content!
                  </p>
                  <button
                    onClick={() => toast.promise(handleSaveDefaultResumeData(), { loading: 'Saving...' })}
                    disabled={isLoading}
                    className='flex items-center justify-center gap-2 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto shadow-lg flex-shrink-0'
                  >
                    <SaveIcon className='size-4 sm:size-5' />
                    <span className="hidden sm:inline">Save AI Preferences</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default UserProfile
