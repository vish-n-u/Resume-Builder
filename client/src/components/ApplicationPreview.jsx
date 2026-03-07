import React, { useState, useRef } from 'react'
import { X, Send, Loader2, Mail, FileText, Edit3 } from 'lucide-react'
import ResumePreview from './ResumePreview'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import api from '../configs/api'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const ApplicationPreview = ({ isOpen, onClose, application, resume, job, onSent }) => {
  const { token } = useSelector(state => state.auth)
  const [emailSubject, setEmailSubject] = useState(application?.emailSubject || '')
  const [emailBody, setEmailBody] = useState(application?.emailBody || '')
  const [recipientEmail, setRecipientEmail] = useState(application?.recipientEmail || '')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('email')
  const resumeRef = useRef(null)

  if (!isOpen || !application) return null

  const generatePDF = async () => {
    const resumeElement = resumeRef.current?.querySelector('#resume-preview')
    if (!resumeElement) {
      throw new Error('Resume preview not found')
    }

    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

    const pdfBase64 = pdf.output('datauristring').split(',')[1]
    return pdfBase64
  }

  const handleSave = async () => {
    try {
      await api.put(`/api/applications/${application._id}/edit`, {
        emailSubject,
        emailBody,
        recipientEmail,
      }, { headers: { Authorization: token } })
      toast.success('Changes saved')
    } catch (error) {
      toast.error('Failed to save changes')
    }
  }

  const handleSend = async () => {
    if (!recipientEmail) {
      toast.error('Please enter the recipient email address')
      return
    }

    setSending(true)
    try {
      await api.put(`/api/applications/${application._id}/edit`, {
        emailSubject,
        emailBody,
        recipientEmail,
      }, { headers: { Authorization: token } })

      const pdfBase64 = await generatePDF()

      await api.post(`/api/email/send/${application._id}`, {
        pdfBase64,
      }, { headers: { Authorization: token } })

      toast.success('Application sent successfully!')
      onSent?.(application._id)
      onClose()
    } catch (error) {
      console.error('Error sending application:', error)
      toast.error(error.response?.data?.message || 'Failed to send application')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden flex flex-col shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>Review Application</h2>
            <p className='text-sm text-gray-500'>{job?.title} at {job?.company}</p>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg'>
            <X className='size-5' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-200'>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'email'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className='size-4' />
            Email
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'resume'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className='size-4' />
            Tailored Resume
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {activeTab === 'email' ? (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Recipient Email</label>
                <input
                  type='email'
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder='hr@company.com'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
                <input
                  type='text'
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Email Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none'
                />
              </div>
            </div>
          ) : (
            <div ref={resumeRef}>
              <ResumePreview
                data={resume}
                template={resume?.template || 'classic'}
                accentColor={resume?.accent_color || '#000000'}
                classes='py-4 bg-white'
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={handleSave}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2'
          >
            <Edit3 className='size-4' />
            Save Draft
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className='px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 disabled:opacity-50 shadow-lg'
          >
            {sending ? (
              <>
                <Loader2 className='size-4 animate-spin' />
                Sending...
              </>
            ) : (
              <>
                <Send className='size-4' />
                Send Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationPreview
