import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, UserIcon, KeyIcon, SaveIcon, Briefcase, GraduationCap, FolderIcon, Sparkles, FileTextIcon, PlusIcon, TrashIcon } from 'lucide-react'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { login } from '../app/features/authSlice'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm'
import ExperienceForm from '../components/ExperienceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillsForm from '../components/SkillsForm'

const UserProfile = () => {

  const { user, token } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const [activeTab, setActiveTab] = useState('account') // account, resume-data, security
  const [isLoading, setIsLoading] = useState(false)

  // Account fields
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Security fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
  })

  const [removeBackground, setRemoveBackground] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Load user's default resume data
  useEffect(() => {
    const loadDefaultResumeData = async () => {
      try {
        setIsDataLoading(true)
        const { data } = await api.get('/api/users/default-resume-data', { headers: { Authorization: token } })

        console.log('Loaded default resume data:', data.defaultResumeData)

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

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters!')
      return
    }

    setIsLoading(true)
    try {
      await api.put('/api/users/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: token } }
      )
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  // Save default resume data
  const handleSaveDefaultResumeData = async () => {
    setIsLoading(true)
    try {
      console.log('Saving default resume data:', defaultResumeData)

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

      console.log('Saved data response:', data.defaultResumeData)

      // Update local state with saved data (including image URL if uploaded)
      if (data.defaultResumeData) {
        setDefaultResumeData(data.defaultResumeData)
      }

      toast.success('Default resume data saved successfully!')
    } catch (error) {
      console.error('Error saving default resume data:', error)
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  const tabs = [
    { id: 'account', name: 'Account Info', icon: UserIcon },
    { id: 'resume-data', name: 'Default Resume Data', icon: FileTextIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 py-8'>

        {/* Back Button */}
        <Link to='/app' className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all mb-6'>
          <ArrowLeftIcon className="size-4" /> Back to Dashboard
        </Link>

        {/* Page Title */}
        <h1 className='text-3xl font-bold text-slate-800 mb-2'>Profile Settings</h1>
        <p className='text-slate-600 mb-8'>Manage your account and set default resume information</p>

        {/* Tabs */}
        <div className='flex gap-2 mb-6 border-b border-gray-200'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Icon className='size-5' />
                <span className='max-sm:hidden'>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>

          {/* Account Info Tab */}
          {activeTab === 'account' && (
            <div>
              <h2 className='text-2xl font-semibold text-slate-800 mb-6'>Account Information</h2>
              <form onSubmit={handleUpdateAccount} className='space-y-4 max-w-2xl'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className='bg-gradient-to-br from-indigo-500 to-indigo-600 text-white px-8 py-2.5 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Default Resume Data Tab */}
          {activeTab === 'resume-data' && (
            <div>
              <div className='mb-6'>
                <h2 className='text-2xl font-semibold text-slate-800 mb-2'>Default Resume Data</h2>
                <p className='text-slate-600'>This information will be used to auto-fill new resumes you create</p>
              </div>

              {isDataLoading ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4'></div>
                    <p className='text-slate-600'>Loading your data...</p>
                  </div>
                </div>
              ) : (
              <div className='space-y-8'>
                {/* Personal Info Section */}
                <div className='border-b border-gray-200 pb-8'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <UserIcon className='size-5 text-indigo-600' />
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
                <div className='border-b border-gray-200 pb-8'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <FileTextIcon className='size-5 text-indigo-600' />
                    Professional Summary
                  </h3>
                  <ProfessionalSummaryForm
                    data={defaultResumeData.professional_summary}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, professional_summary: data }))}
                    setResumeData={setDefaultResumeData}
                  />
                </div>

                {/* Skills Section */}
                <div className='border-b border-gray-200 pb-8'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <Sparkles className='size-5 text-indigo-600' />
                    Skills
                  </h3>
                  <SkillsForm
                    data={defaultResumeData.skills}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, skills: data }))}
                  />
                </div>

                {/* Experience Section */}
                <div className='border-b border-gray-200 pb-8'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <Briefcase className='size-5 text-indigo-600' />
                    Work Experience
                  </h3>
                  <ExperienceForm
                    data={defaultResumeData.experience}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, experience: data }))}
                  />
                </div>

                {/* Education Section */}
                <div className='border-b border-gray-200 pb-8'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <GraduationCap className='size-5 text-indigo-600' />
                    Education
                  </h3>
                  <EducationForm
                    data={defaultResumeData.education}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, education: data }))}
                  />
                </div>

                {/* Projects Section */}
                <div className='pb-8'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                    <FolderIcon className='size-5 text-indigo-600' />
                    Projects
                  </h3>
                  <ProjectForm
                    data={defaultResumeData.project}
                    onChange={(data) => setDefaultResumeData(prev => ({ ...prev, project: data }))}
                  />
                </div>

                {/* Save Button */}
                <div className='pt-4 border-t border-gray-200'>
                  <button
                    onClick={() => toast.promise(handleSaveDefaultResumeData(), { loading: 'Saving...' })}
                    disabled={isLoading}
                    className='flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <SaveIcon className='size-5' />
                    Save Default Resume Data
                  </button>
                  <p className='text-sm text-slate-500 mt-3'>
                    💡 Tip: Fill out your information here once, and it will automatically populate when you create new resumes!
                  </p>
                </div>
              </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className='text-2xl font-semibold text-slate-800 mb-6'>Change Password</h2>
              <form onSubmit={handleChangePassword} className='space-y-4 max-w-2xl'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                    minLength={6}
                  />
                  <p className='text-sm text-slate-500 mt-1'>Must be at least 6 characters</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className='bg-gradient-to-br from-indigo-500 to-indigo-600 text-white px-8 py-2.5 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default UserProfile
