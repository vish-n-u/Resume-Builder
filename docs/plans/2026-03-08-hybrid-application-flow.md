# Hybrid Application Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-lookup employer emails via Hunter.io during job fetch; if found use email flow, if not show "Apply on Website" + "Download Resume" flow.

**Architecture:** Hunter.io domain-search is called per unique company during job feed fetch. The found email is stored in `job.applyEmail`. The frontend detects whether an email exists and switches between the email send flow and the external apply flow. A new `applied_externally` status tracks jobs applied via the website link.

**Tech Stack:** Hunter.io REST API, Express backend, React + Redux frontend, jsPDF for resume download.

---

### Task 1: Add Hunter.io Email Lookup Utility

**Files:**
- Create: `server/utils/hunterLookup.js`

**Step 1: Create the Hunter.io lookup function**

```js
// server/utils/hunterLookup.js

/**
 * Look up a company's HR/recruitment email using Hunter.io domain-search API.
 * Returns the best email found, or empty string if none.
 */
export const lookupCompanyEmail = async (companyName) => {
    const apiKey = process.env.HUNTER_API_KEY;
    if (!apiKey) return '';

    try {
        // Convert company name to likely domain (e.g. "Google" -> "google.com")
        const domain = companyName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            + '.com';

        const response = await fetch(
            `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${apiKey}&limit=5`
        );

        if (!response.ok) return '';

        const data = await response.json();
        const emails = data?.data?.emails || [];

        if (emails.length === 0) return '';

        // Prioritize HR/recruitment roles
        const hrKeywords = ['hr', 'human resources', 'recruitment', 'recruiter', 'talent', 'hiring', 'people'];
        const hrEmail = emails.find(e =>
            hrKeywords.some(kw =>
                (e.position || '').toLowerCase().includes(kw) ||
                (e.department || '').toLowerCase().includes(kw)
            )
        );

        if (hrEmail) return hrEmail.value;

        // Fall back to the first email with highest confidence
        const sorted = [...emails].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        return sorted[0]?.value || '';
    } catch (error) {
        console.error(`Hunter.io lookup failed for "${companyName}":`, error.message);
        return '';
    }
};
```

**Step 2: Commit**

```bash
git add server/utils/hunterLookup.js
git commit -m "feat: add Hunter.io email lookup utility"
```

---

### Task 2: Integrate Hunter.io Into Job Feed Controller

**Files:**
- Modify: `server/controllers/jobController.js`

**Step 1: Import the lookup utility and call it during job processing**

At the top of `jobController.js`, add:
```js
import { lookupCompanyEmail } from "../utils/hunterLookup.js";
```

In the `getJobFeed` function, replace the hardcoded `applyEmail: '',` line (line ~92) with a Hunter.io lookup. To avoid hitting rate limits, batch lookups by unique company name. Replace the job processing loop (lines 78-110) with:

```js
        // Cache jobs in DB and filter out dismissed/applied
        const jobs = [];
        // Cache Hunter.io lookups per company to avoid duplicate calls
        const emailCache = {};

        for (const item of apiData.data) {
            const companyName = item.employer_name || '';

            // Lookup email from Hunter.io (cached per company)
            let applyEmail = '';
            if (companyName) {
                if (emailCache[companyName] === undefined) {
                    emailCache[companyName] = await lookupCompanyEmail(companyName);
                }
                applyEmail = emailCache[companyName];
            }

            const jobData = {
                externalId: item.job_id,
                title: item.job_title || '',
                company: companyName,
                location: item.job_city ? `${item.job_city}, ${item.job_state || ''}, ${item.job_country || ''}` : (item.job_country || 'Remote'),
                type: item.job_is_remote ? 'remote' : 'onsite',
                salary: item.job_min_salary && item.job_max_salary
                    ? `$${item.job_min_salary} - $${item.job_max_salary}`
                    : '',
                description: item.job_description || '',
                skills: item.job_required_skills || [],
                applyUrl: item.job_apply_link || '',
                applyEmail,
                postedDate: item.job_posted_at_datetime_utc ? new Date(item.job_posted_at_datetime_utc) : new Date(),
                source: 'jsearch',
                fetchedAt: new Date(),
            };

            // Upsert job into DB
            const job = await Job.findOneAndUpdate(
                { externalId: jobData.externalId },
                jobData,
                { upsert: true, new: true }
            );

            // Only include if not dismissed/applied and matches type filter
            if (!excludeJobIds.some(id => id.toString() === job._id.toString())) {
                if (filterType === 'onsite' && job.type === 'remote') continue;
                jobs.push(job);
            }
        }
```

**Step 2: Commit**

```bash
git add server/controllers/jobController.js
git commit -m "feat: integrate Hunter.io email lookup into job feed"
```

---

### Task 3: Add `applied_externally` Status to Application Model

**Files:**
- Modify: `server/models/Application.js`

**Step 1: Update the status enum**

Change line 10 from:
```js
    status: { type: String, enum: ['draft', 'sent', 'failed'], default: 'draft' },
```
to:
```js
    status: { type: String, enum: ['draft', 'sent', 'failed', 'applied_externally'], default: 'draft' },
```

**Step 2: Commit**

```bash
git add server/models/Application.js
git commit -m "feat: add applied_externally status to Application model"
```

---

### Task 4: Add External Apply Endpoint

**Files:**
- Modify: `server/controllers/applicationController.js`
- Modify: `server/routes/applicationRoutes.js`

**Step 1: Add the `applyExternally` controller function**

Add at the end of `applicationController.js` (before the closing of the file):

```js
// POST /api/applications/:id/apply-external - Mark application as applied externally
export const applyExternally = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const application = await Application.findOne({ _id: id, userId });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        application.status = 'applied_externally';
        application.sentAt = new Date();
        await application.save();

        res.json({ application });
    } catch (error) {
        console.error("Error marking external application:", error);
        res.status(500).json({ message: "Failed to mark application" });
    }
};
```

**Step 2: Add the route**

In `server/routes/applicationRoutes.js`, update the import:
```js
import { prepareApplication, editApplication, getApplications, applyExternally } from '../controllers/applicationController.js';
```

Add the route:
```js
applicationRouter.post('/:id/apply-external', protect, applyExternally);
```

**Step 3: Commit**

```bash
git add server/controllers/applicationController.js server/routes/applicationRoutes.js
git commit -m "feat: add apply-externally endpoint for website applications"
```

---

### Task 5: Update Jobs.jsx — Remove Email Requirement for External Apply

**Files:**
- Modify: `client/src/pages/Jobs.jsx`

**Step 1: Allow swipe-right without email connection when job has no applyEmail**

In the `handleSwipeRight` function, the current code blocks swiping if email is not connected. Change it so the email check only blocks when the job has an `applyEmail` (email flow). When the job has no `applyEmail`, the user can still swipe right and go through the external flow.

Replace lines 83-109 (`handleSwipeRight` function body):

```jsx
  const handleSwipeRight = async (job) => {
    dispatch(removeJob(job._id))

    // Only require email connection for jobs with an apply email
    if (job.applyEmail && !emailConnected) {
      toast.error('Please connect your email first in your profile settings')
      return
    }

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
```

**Step 2: Commit**

```bash
git add client/src/pages/Jobs.jsx
git commit -m "feat: allow swipe-right without email for external-apply jobs"
```

---

### Task 6: Update ApplicationPreview — Dual Mode (Email vs External)

**Files:**
- Modify: `client/src/components/ApplicationPreview.jsx`

**Step 1: Rewrite ApplicationPreview to support both modes**

Replace the entire file content with:

```jsx
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
      // Mark application as applied externally
      await api.post(`/api/applications/${application._id}/apply-external`, {}, {
        headers: { Authorization: token }
      })

      // Open the apply URL in a new tab
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
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden flex flex-col shadow-2xl'>
        {/* Header */}
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

        {/* Tabs */}
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

        {/* Content */}
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

        {/* Footer — changes based on mode */}
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
```

**Step 2: Commit**

```bash
git add client/src/components/ApplicationPreview.jsx
git commit -m "feat: dual-mode ApplicationPreview (email send vs external apply)"
```

---

### Task 7: Update Applied Page — Show `applied_externally` Badge

**Files:**
- Modify: `client/src/pages/Applied.jsx`

**Step 1: Add the new status badge**

In the `getStatusBadge` function, add a case before `default`:

```jsx
      case 'applied_externally':
        return (
          <span className='inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full'>
            <ExternalLink className='size-3' /> Applied Externally
          </span>
        )
```

**Step 2: Commit**

```bash
git add client/src/pages/Applied.jsx
git commit -m "feat: show applied_externally badge in Applied tracker"
```

---

### Task 8: Add HUNTER_API_KEY to Environment

**Files:**
- Modify: `server/.env` (user must add manually)

**Step 1: Add the env variable**

The user needs to add to their `.env`:
```
HUNTER_API_KEY=your_hunter_io_api_key_here
```

This is a manual step — no code change needed. The `lookupCompanyEmail` function gracefully returns `''` if the key is not set.

---

### Summary of All Changes

| File | Action | Purpose |
|------|--------|---------|
| `server/utils/hunterLookup.js` | Create | Hunter.io email lookup utility |
| `server/controllers/jobController.js` | Modify | Call Hunter.io per company during feed fetch |
| `server/models/Application.js` | Modify | Add `applied_externally` to status enum |
| `server/controllers/applicationController.js` | Modify | Add `applyExternally` endpoint |
| `server/routes/applicationRoutes.js` | Modify | Add route for apply-external |
| `client/src/pages/Jobs.jsx` | Modify | Allow swipe-right without email for external jobs |
| `client/src/components/ApplicationPreview.jsx` | Modify | Dual-mode: email send vs download+apply on website |
| `client/src/pages/Applied.jsx` | Modify | Badge for `applied_externally` status |
