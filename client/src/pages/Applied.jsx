import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setApplications, setApplicationsLoading } from '../app/features/applicationsSlice'
import api from '../configs/api'
import { CheckCircle, XCircle, Clock, ExternalLink, FileText } from 'lucide-react'
import SEO from '../components/SEO'

const Applied = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const { list, loading } = useSelector(state => state.applications)

  const fetchApplications = async () => {
    dispatch(setApplicationsLoading(true))
    try {
      const { data } = await api.get('/api/applications', { headers: { Authorization: token } })
      dispatch(setApplications(data.applications))
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full'>
            <CheckCircle className='size-3' /> Sent
          </span>
        )
      case 'failed':
        return (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-700 px-2.5 py-1 rounded-full'>
            <XCircle className='size-3' /> Failed
          </span>
        )
      case 'applied_externally':
        return (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full'>
            <ExternalLink className='size-3' /> Applied Externally
          </span>
        )
      default:
        return (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full'>
            <Clock className='size-3' /> Draft
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Applied Jobs Tracker | Flower Resume"
        description="Track all your job applications in one place."
      />

      <div className='max-w-5xl mx-auto px-4 py-6'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>Applied Jobs</h1>

        {list.length === 0 ? (
          <div className='text-center py-16'>
            <FileText className='size-16 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 text-lg'>No applications yet</p>
            <p className='text-gray-400 mt-1 text-sm'>Start swiping on jobs to apply!</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {list.map((app) => (
              <div
                key={app._id}
                className='bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow'
              >
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-900 truncate'>
                      {app.jobId?.title || 'Unknown Job'}
                    </h3>
                    <p className='text-sm text-gray-500 mt-0.5'>
                      {app.jobId?.company || 'Unknown Company'}
                      {app.jobId?.location && ` - ${app.jobId.location}`}
                    </p>
                    {app.recipientEmail && (
                      <p className='text-xs text-gray-400 mt-1'>To: {app.recipientEmail}</p>
                    )}
                  </div>

                  <div className='flex items-center gap-3 shrink-0'>
                    {getStatusBadge(app.status)}

                    <span className='text-xs text-gray-400'>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>

                    {app.jobId?.applyUrl && (
                      <a
                        href={app.jobId.applyUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600'
                        title='View original listing'
                      >
                        <ExternalLink className='size-4' />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Applied
