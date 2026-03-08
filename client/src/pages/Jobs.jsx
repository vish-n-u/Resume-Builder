import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setJobs, removeJob, setJobsLoading, setJobsError, setFilters } from '../app/features/jobsSlice'
import { setCurrentApplication, clearCurrentApplication } from '../app/features/applicationsSlice'
import SwipeContainer from '../components/SwipeContainer'
import ApplicationPreview from '../components/ApplicationPreview'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, Search, MapPin, Briefcase, SlidersHorizontal, X } from 'lucide-react'
import SEO from '../components/SEO'

const Jobs = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const { feed, loading, error, filters } = useSelector(state => state.jobs)
  const { currentApplication } = useSelector(state => state.applications)

  const [previewData, setPreviewData] = useState(null)
  const [emailConnected, setEmailConnected] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const checkEmailStatus = async () => {
    try {
      const { data } = await api.get('/api/email/status', { headers: { Authorization: token } })
      setEmailConnected(data.connected)
    } catch {
      setEmailConnected(false)
    } finally {
      setCheckingEmail(false)
    }
  }

  const fetchJobs = async (appliedFilters = filters) => {
    dispatch(setJobsLoading(true))
    try {
      const params = {}
      if (appliedFilters.keyword) params.keyword = appliedFilters.keyword
      if (appliedFilters.location) params.location = appliedFilters.location
      if (appliedFilters.type) params.type = appliedFilters.type

      const { data } = await api.get('/api/jobs/feed', {
        headers: { Authorization: token },
        params,
      })
      dispatch(setJobs(data.jobs))
    } catch (error) {
      dispatch(setJobsError(error.response?.data?.message || 'Failed to fetch jobs'))
      toast.error(error.response?.data?.message || 'Failed to fetch jobs')
    }
  }

  useEffect(() => {
    checkEmailStatus()
    fetchJobs()
  }, [])

  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters))
    fetchJobs(localFilters)
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    const cleared = { keyword: '', location: '', type: '' }
    setLocalFilters(cleared)
    dispatch(setFilters(cleared))
    fetchJobs(cleared)
    setShowFilters(false)
  }

  const hasActiveFilters = filters.keyword || filters.location || filters.type

  const handleSwipeLeft = async (job) => {
    dispatch(removeJob(job._id))
    try {
      await api.post('/api/jobs/dismiss', { jobId: job._id }, { headers: { Authorization: token } })
    } catch {}
  }

  const handleSwipeRight = async (job) => {
    // Only require email connection for jobs with an apply email
    if (job.applyEmail && !emailConnected) {
      toast.error('Please connect your email first in your profile settings')
      return
    }

    dispatch(removeJob(job._id))

    try {
      toast.loading('Generating tailored resume...', { id: 'preparing' })

      const { data } = await api.post('/api/applications/prepare', {
        jobId: job._id,
      }, { headers: { Authorization: token } })

      toast.dismiss('preparing')

      setPreviewData({
        application: data.application,
        resume: data.resume,
        job: data.job,
      })
      dispatch(setCurrentApplication(data.application))
    } catch (error) {
      toast.dismiss('preparing')
      toast.error(error.response?.data?.message || 'Failed to prepare application')
    }
  }

  const handleApplicationSent = (applicationId) => {
    dispatch(clearCurrentApplication())
    setPreviewData(null)
    toast.success('Application sent!')
  }

  return (
    <>
      <SEO
        title="Job Swipe - Find & Apply to Jobs | Flower Resume"
        description="Swipe through personalized job suggestions and apply with AI-tailored resumes in one click."
      />

      <div className='max-w-7xl mx-auto px-4 py-6'>
        {!checkingEmail && !emailConnected && (
          <div className='mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3'>
            <AlertCircle className='size-5 text-amber-500 shrink-0' />
            <div className='flex-1'>
              <p className='text-sm text-amber-800 font-medium'>Email not connected</p>
              <p className='text-xs text-amber-600 mt-0.5'>Connect your Gmail or Outlook to send applications directly.</p>
            </div>
            <Link
              to='/app/profile'
              className='px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2 shrink-0'
            >
              <Mail className='size-4' />
              Connect
            </Link>
          </div>
        )}

        {/* Filter Bar */}
        <div className='mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                hasActiveFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className='size-4' />
              Filters
              {hasActiveFilters && (
                <span className='bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {[filters.keyword, filters.location, filters.type].filter(Boolean).length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <>
                {filters.keyword && (
                  <span className='inline-flex items-center gap-1 text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full'>
                    <Search className='size-3' />
                    {filters.keyword}
                  </span>
                )}
                {filters.location && (
                  <span className='inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full'>
                    <MapPin className='size-3' />
                    {filters.location}
                  </span>
                )}
                {filters.type && (
                  <span className='inline-flex items-center gap-1 text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full'>
                    <Briefcase className='size-3' />
                    {filters.type}
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className='text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1'
                >
                  <X className='size-3' />
                  Clear all
                </button>
              </>
            )}
          </div>

          {showFilters && (
            <div className='mt-3 bg-white border border-gray-200 rounded-xl p-4 shadow-lg'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1.5'>Job Title / Keyword</label>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400' />
                    <input
                      type='text'
                      value={localFilters.keyword}
                      onChange={(e) => setLocalFilters({ ...localFilters, keyword: e.target.value })}
                      placeholder='e.g. React Developer'
                      className='w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1.5'>Location</label>
                  <div className='relative'>
                    <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400' />
                    <input
                      type='text'
                      value={localFilters.location}
                      onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
                      placeholder='e.g. New York, Remote'
                      className='w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1.5'>Job Type</label>
                  <div className='relative'>
                    <Briefcase className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400' />
                    <select
                      value={localFilters.type}
                      onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                      className='w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white'
                    >
                      <option value=''>All Types</option>
                      <option value='remote'>Remote</option>
                      <option value='onsite'>On-site</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className='flex justify-end gap-2 mt-4'>
                <button
                  onClick={handleClearFilters}
                  className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800'
                >
                  Clear
                </button>
                <button
                  onClick={handleApplyFilters}
                  className='px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-xl p-4'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}

        <div className='flex  justify-center'>
          <SwipeContainer
            jobs={feed}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            loading={loading}
          />
        </div>
      </div>

      {previewData && (
        <ApplicationPreview
          isOpen={!!previewData}
          onClose={() => {
            setPreviewData(null)
            dispatch(clearCurrentApplication())
          }}
          application={previewData.application}
          resume={previewData.resume}
          job={previewData.job}
          onSent={handleApplicationSent}
        />
      )}
    </>
  )
}

export default Jobs
