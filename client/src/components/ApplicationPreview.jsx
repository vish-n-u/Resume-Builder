import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Mail, FileText, Edit3, ExternalLink, Download, Upload, CheckCircle } from 'lucide-react'
import ResumePreview from './ResumePreview'
import api from '../configs/api'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import ResumeEditDrawer from './ResumeEditDrawer'

const ApplicationPreview = ({ isOpen, onClose, application, resume, job, onSent }) => {
  const { token } = useSelector(state => state.auth)
  const [emailSubject, setEmailSubject] = useState(application?.emailSubject || '')
  const [emailBody, setEmailBody] = useState(application?.emailBody || '')
  const [recipientEmail, setRecipientEmail] = useState(application?.recipientEmail || job?.applyEmail || '')
  const [sending, setSending] = useState(false)
  const [resumeData, setResumeData] = useState(resume)
  const [showDrawer, setShowDrawer] = useState(false)

  useEffect(() => {
    setResumeData(resume)
  }, [resume])

  const [activeTab, setActiveTab] = useState(job?.applyEmail ? 'email' : 'resume')
  const [pdfFile, setPdfFile] = useState(null)
  const fileInputRef = useRef(null)
  const resumeRef = useRef(null)

  const hasEmail = !!job?.applyEmail

  if (!isOpen || !application) return null

  const handleDownloadResume = () => {
    // Open a clean window with just the resume and trigger print
    const resumeElement = resumeRef.current?.querySelector('#resume-preview')
    if (!resumeElement) {
      toast.error('Resume preview not found')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups and try again.')
      return
    }

    // Collect all stylesheets from the current page
    const stylesheets = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules || []).map(rule => rule.cssText).join('\n')
        } catch {
          // Cross-origin stylesheet — link it instead
          return sheet.href ? `@import url("${sheet.href}");` : ''
        }
      })
      .join('\n')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${job?.title || 'Resume'} - ${job?.company || 'Download'}</title>
        <style>
          ${stylesheets}

          @page {
            size: letter;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }
        </style>
      </head>
      <body>
        ${resumeElement.outerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()

    // Wait for content to render, then print
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
    // Fallback if onload doesn't fire
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
  }

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF must be under 10MB')
      return
    }

    setPdfFile(file)
    toast.success('Resume PDF attached!')
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

  const handleResumeChange = (field, value) => {
    setResumeData(prev => ({ ...prev, [field]: value }))
  }

  const handleResumeBlur = async () => {
    try {
      const formData = new FormData()
      formData.append('resumeId', resumeData._id)
      formData.append('resumeData', JSON.stringify(resumeData))
      await api.put('/api/resumes/update', formData, { headers: { Authorization: token } })
    } catch {
      toast.error('Failed to save resume changes')
    }
  }

  const handleSend = async () => {
    if (!recipientEmail) {
      toast.error('Please enter the recipient email address')
      return
    }

    if (!pdfFile) {
      toast.error('Please attach your resume PDF first. Download it from the Resume tab, then upload it here.')
      return
    }

    setSending(true)
    try {
      await api.put(`/api/applications/${application._id}/edit`, {
        emailSubject,
        emailBody,
        recipientEmail,
      }, { headers: { Authorization: token } })

      // Convert uploaded PDF to base64
      const pdfBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(pdfFile)
      })

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
                  rows={8}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none'
                />
              </div>

              {/* PDF Upload Section */}
              <div className='border-t border-gray-200 pt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Resume Attachment</label>
                <p className='text-xs text-gray-500 mb-3'>
                  Download your tailored resume from the Resume tab (using Save as PDF), then attach it here.
                </p>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.pdf'
                  onChange={handlePdfUpload}
                  className='hidden'
                />
                {pdfFile ? (
                  <div className='flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg'>
                    <CheckCircle className='size-5 text-green-600 shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-green-800 truncate'>{pdfFile.name}</p>
                      <p className='text-xs text-green-600'>{(pdfFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className='text-xs text-green-700 hover:text-green-900 font-medium'
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className='w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors'
                  >
                    <Upload className='size-4' />
                    Attach Resume PDF
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div ref={resumeRef}>
              <div className='flex justify-end mb-3'>
                <button
                  onClick={() => setShowDrawer(true)}
                  className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <Edit3 className='size-3.5' />
                  Edit Resume
                </button>
              </div>
              <ResumePreview
                data={resumeData}
                template={resume?.template || 'classic'}
                accentColor={resume?.accent_color || '#000000'}
                classes='py-4 bg-white'
              />
            </div>
          )}
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
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleDownloadResume}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2'
                >
                  <Download className='size-4' />
                  Download Resume
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

        {showDrawer && (
          <ResumeEditDrawer
            resume={resumeData}
            onChange={handleResumeChange}
            onBlur={handleResumeBlur}
            onClose={() => setShowDrawer(false)}
          />
        )}
      </div>
    </div>
  )
}

export default ApplicationPreview
