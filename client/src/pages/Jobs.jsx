import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setJobs, removeJob, setJobsLoading, setJobsError } from '../app/features/jobsSlice'
import { setCurrentApplication, clearCurrentApplication } from '../app/features/applicationsSlice'
import SwipeContainer from '../components/SwipeContainer'
import ApplicationPreview from '../components/ApplicationPreview'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle } from 'lucide-react'
import SEO from '../components/SEO'

const Jobs = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const { feed, loading, error } = useSelector(state => state.jobs)
  const { currentApplication } = useSelector(state => state.applications)

  const [previewData, setPreviewData] = useState(null)
  const [emailConnected, setEmailConnected] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(true)

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

  const fetchJobs = async () => {
    dispatch(setJobsLoading(true))
    try {
      const { data } = await api.get('/api/jobs/feed', { headers: { Authorization: token } })
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

  const handleSwipeLeft = async (job) => {
    dispatch(removeJob(job._id))
    try {
      await api.post('/api/jobs/dismiss', { jobId: job._id }, { headers: { Authorization: token } })
    } catch {}
  }

  const handleSwipeRight = async (job) => {
    dispatch(removeJob(job._id))

    if (!emailConnected) {
      toast.error('Please connect your email first in your profile settings')
      return
    }

    try {
      toast.loading('Generating tailored resume & email...', { id: 'preparing' })

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
