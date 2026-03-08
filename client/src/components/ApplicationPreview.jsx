import React, { useState, useRef } from 'react'
import { X, Send, Loader2, Mail, FileText, Edit3, ExternalLink, Download } from 'lucide-react'
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
  const [recipientEmail, setRecipientEmail] = useState(application?.recipientEmail || job?.applyEmail || '')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState(job?.applyEmail ? 'email' : 'resume')
  const resumeRef = useRef(null)

  const hasEmail = !!job?.applyEmail

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
    return pdf
  }

  const handleDownloadResume = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf' })
      const pdf = await generatePDF()
      pdf.save(`${job?.title || 'Resume'} - ${job?.company || 'Application'}.pdf`)
      toast.dismiss('pdf')
      toast.success('Resume downloaded!')
    } catch (error) {
      toast.dismiss('pdf')
      toast.error('Failed to generate PDF')
    }
  }

  const handleApplyOnWebsite = async () => {
    setSending(true)
    try {
      await api.post(`/api/applications/${application._id}/apply-external`, {}, {
        headers: { Authorization: token }
      })

      if (job?.applyUrl) {
        window.open(job.applyUrl, '_blank')
      }

      toast.success('Application tracked! Apply on the website now.')
      onSent?.(application._id)
      onClose()
    } catch (error) {
      toast.error('Failed to track application')
    } finally {
      setSending(false)
    }
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

      const pdf = await generatePDF()
      const pdfBase64 = pdf.output('datauristring').split(',')[1]

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
      <div className='absolute inset-0 bg-black/60' onClick={onClose} />

      <div className='relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden flex flex-col shadow-2xl'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>Review Application</h2>
            <p className='text-sm text-gray-500'>{job?.title} at {job?.company}</p>
            {!hasEmail && (
              <p className='text-xs text-amber-600 mt-1'>No email found — apply on website with your tailored resume</p>
            )}
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg'>
            <X className='size-5' />
          </button>
        </div>

        <div className='flex border-b border-gray-200'>
          {hasEmail && (
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
          )}
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

        <div className='flex-1 overflow-y-auto p-6'>
          {/* Always render resume preview so PDF generation works from any tab */}
          <div ref={resumeRef} style={{ display: activeTab === 'resume' ? 'block' : 'none' }}>
            <ResumePreview
              data={resume}
              template={resume?.template || 'classic'}
              accentColor={resume?.accent_color || '#000000'}
              classes='py-4 bg-white'
            />
          </div>
          {activeTab === 'email' && hasEmail ? (
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
          ) : null}
        </div>

        <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50'>
          {hasEmail ? (
            <>
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
            </>
          ) : (
            <>
              <button
                onClick={handleDownloadResume}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2'
              >
                <Download className='size-4' />
                Download Resume
              </button>
              <button
                onClick={handleApplyOnWebsite}
                disabled={sending}
                className='px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 disabled:opacity-50 shadow-lg'
              >
                {sending ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    <ExternalLink className='size-4' />
                    Apply on Website
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationPreview
