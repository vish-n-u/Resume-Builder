import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { Mail, CheckCircle, Unplug } from 'lucide-react'

const EmailConnect = () => {
  const { token } = useSelector(state => state.auth)
  const [status, setStatus] = useState({ connected: false, provider: 'none' })
  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/api/email/status', { headers: { Authorization: token } })
      setStatus(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()

    const params = new URLSearchParams(window.location.search)
    if (params.get('emailConnected') === 'true') {
      toast.success('Email connected successfully!')
      checkStatus()
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('emailError') === 'true') {
      toast.error('Failed to connect email. Please try again.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const connectGoogle = async () => {
    try {
      const { data } = await api.get('/api/email/auth/google', { headers: { Authorization: token } })
      window.location.href = data.authUrl
    } catch {
      toast.error('Failed to initiate Google sign-in')
    }
  }

  const connectOutlook = async () => {
    try {
      const { data } = await api.get('/api/email/auth/outlook', { headers: { Authorization: token } })
      window.location.href = data.authUrl
    } catch {
      toast.error('Failed to initiate Outlook sign-in')
    }
  }

  const disconnect = async () => {
    try {
      await api.delete('/api/email/disconnect', { headers: { Authorization: token } })
      setStatus({ connected: false, provider: 'none' })
      toast.success('Email disconnected')
    } catch {
      toast.error('Failed to disconnect email')
    }
  }

  if (loading) {
    return <div className='animate-pulse h-20 bg-gray-100 rounded-xl'></div>
  }

  return (
    <div className='bg-white border border-gray-200 rounded-xl p-5'>
      <h3 className='text-base font-semibold text-gray-900 mb-1 flex items-center gap-2'>
        <Mail className='size-5 text-blue-600' />
        Email Connection
      </h3>
      <p className='text-sm text-gray-500 mb-4'>Connect your email to send job applications directly.</p>

      {status.connected ? (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CheckCircle className='size-5 text-green-500' />
            <span className='text-sm font-medium text-gray-700'>
              Connected via {status.provider === 'gmail' ? 'Gmail' : 'Outlook'}
            </span>
          </div>
          <button
            onClick={disconnect}
            className='px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 flex items-center gap-1.5'
          >
            <Unplug className='size-3.5' />
            Disconnect
          </button>
        </div>
      ) : (
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={connectGoogle}
            className='flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium'
          >
            <svg className='size-5' viewBox='0 0 24 24'>
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'/>
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
            </svg>
            Connect Gmail
          </button>

          <button
            onClick={connectOutlook}
            className='flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium'
          >
            <svg className='size-5' viewBox='0 0 24 24'>
              <path fill='#0078D4' d='M24 7.387v10.478c0 .23-.08.424-.238.576-.16.154-.352.232-.578.232h-8.96v-6.12l1.602 1.18c.078.055.17.082.275.082.104 0 .196-.027.275-.082L24 7.387zm-9.776 5.166V6.52h8.552c.226 0 .42.078.578.232.158.152.238.346.238.576v.193l-7.09 5.03-2.278-1z'/>
              <path fill='#0078D4' d='M14.224 6.52v6.033l-2.278 1.598v-.002L0 7.522v-.193c0-.23.08-.424.238-.576.16-.154.352-.232.578-.232h13.408z'/>
              <path fill='#0078D4' d='M14.224 12.553v5.772H.816c-.226 0-.42-.078-.578-.232C.08 17.939 0 17.745 0 17.515V7.522l11.946 6.63 2.278-1.598z'/>
              <path fill='#0364B8' d='M8.862 5.834v12.063c0 .2-.058.384-.172.55-.114.167-.266.286-.454.358L1.04 21.766c-.164.067-.322.1-.474.1-.114 0-.224-.017-.328-.05C.08 21.743 0 21.538 0 21.264V5.48c0-.2.058-.384.172-.55.114-.167.266-.286.454-.358L7.636 1.68c.274-.116.53-.1.766.042.236.143.376.358.42.645.026.143.04.29.04.44v3.028z'/>
            </svg>
            Connect Outlook
          </button>
        </div>
      )}
    </div>
  )
}

export default EmailConnect
