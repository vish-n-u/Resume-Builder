# Jobs Page List + Detail Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Tinder swipe UI on the Jobs page with a standard list + detail panel layout (desktop) and bottom sheet (mobile).

**Architecture:** Three new focused components (`JobRow`, `JobDetail`, `JobBottomSheet`) compose into the redesigned `Jobs.jsx`. The existing fetch/filter/apply logic in `Jobs.jsx` is untouched — only the render and swipe-specific state changes. `SwipeContainer` and `JobCard` are deleted entirely.

**Tech Stack:** React 18, Redux Toolkit, Tailwind CSS, Lucide React (already installed)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `client/src/pages/Jobs.jsx` | Remove swipe state/handlers, add `selectedJob` state, render two-panel layout |
| Create | `client/src/components/JobRow.jsx` | Single row in the job list (avatar, title, company, badges) |
| Create | `client/src/components/JobDetail.jsx` | Full job detail view — skills, description, action buttons |
| Create | `client/src/components/JobBottomSheet.jsx` | Mobile bottom sheet wrapper around `JobDetail` |
| Delete | `client/src/components/SwipeContainer.jsx` | No longer needed |
| Delete | `client/src/components/JobCard.jsx` | No longer needed |
| Modify | `client/package.json` | Remove `react-tinder-card` dependency |

---

## Chunk 1: New components

### Task 1: Create `JobRow`

**Files:**
- Create: `client/src/components/JobRow.jsx`

- [ ] **Step 1: Create the file**

```jsx
// client/src/components/JobRow.jsx
import React from 'react'
import { MapPin, DollarSign, Briefcase } from 'lucide-react'

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-rose-500',
  'bg-emerald-600', 'bg-orange-500', 'bg-cyan-600',
]

const avatarColor = (company = '') =>
  AVATAR_COLORS[company.charCodeAt(0) % AVATAR_COLORS.length]

const JobRow = ({ job, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-xl border transition-all ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 bg-white hover:bg-gray-50'
    }`}
  >
    <div className='flex items-start gap-3'>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 ${avatarColor(job.company)}`}>
        {job.company?.charAt(0) || '?'}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-gray-900 truncate'>{job.title}</p>
        <p className='text-xs text-gray-500 truncate'>{job.company} · {job.location}</p>
        <div className='flex gap-1.5 mt-1.5 flex-wrap'>
          {job.type && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              job.type === 'remote' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {job.type === 'remote' ? 'Remote' : 'On-site'}
            </span>
          )}
          {job.salary && (
            <span className='text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>
              {job.salary}
            </span>
          )}
        </div>
      </div>
    </div>
  </button>
)

export default JobRow
```

- [ ] **Step 2: Verify file saved** — no syntax errors, imports look correct

---

### Task 2: Create `JobDetail`

**Files:**
- Create: `client/src/components/JobDetail.jsx`

- [ ] **Step 1: Create the file**

```jsx
// client/src/components/JobDetail.jsx
import React from 'react'
import { MapPin, DollarSign, ExternalLink, Sparkles } from 'lucide-react'

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-rose-500',
  'bg-emerald-600', 'bg-orange-500', 'bg-cyan-600',
]
const avatarColor = (company = '') =>
  AVATAR_COLORS[company.charCodeAt(0) % AVATAR_COLORS.length]

const JobDetail = ({ job, onApply, onApplyExternal }) => {
  if (!job) {
    return (
      <div className='flex items-center justify-center h-full text-gray-400 text-sm'>
        Select a job to view details
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full overflow-y-auto'>
      {/* Header */}
      <div className='flex items-start gap-4 pb-4 border-b border-gray-100 mb-4'>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 ${avatarColor(job.company)}`}>
          {job.company?.charAt(0) || '?'}
        </div>
        <div className='min-w-0 flex-1'>
          <h2 className='text-xl font-bold text-gray-900 leading-tight'>{job.title}</h2>
          <p className='text-sm text-gray-500 mt-0.5'>{job.company}</p>
          <div className='flex flex-wrap gap-2 mt-2'>
            {job.type && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                job.type === 'remote' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {job.type === 'remote' ? 'Remote' : 'On-site'}
              </span>
            )}
            {job.location && (
              <span className='text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full flex items-center gap-1'>
                <MapPin className='size-3' />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span className='text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1'>
                <DollarSign className='size-3' />
                {job.salary}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className='mb-4'>
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Required Skills</p>
          <div className='flex flex-wrap gap-1.5'>
            {job.skills.map((skill, i) => (
              <span key={i} className='text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md'>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className='flex-1 mb-6'>
        <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Description</p>
        <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-line'>{job.description}</p>
      </div>

      {/* Actions */}
      <div className='flex flex-col gap-2 pt-4 border-t border-gray-100'>
        <button
          onClick={onApply}
          className='w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2'
        >
          <Sparkles className='size-4' />
          Apply with AI Resume
        </button>
        {job.applyUrl && (
          <button
            onClick={onApplyExternal}
            className='w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2'
          >
            <ExternalLink className='size-4' />
            Apply on Company Site
          </button>
        )}
      </div>
    </div>
  )
}

export default JobDetail
```

- [ ] **Step 2: Verify file saved**

---

### Task 3: Create `JobBottomSheet` (mobile)

**Files:**
- Create: `client/src/components/JobBottomSheet.jsx`

- [ ] **Step 1: Create the file**

```jsx
// client/src/components/JobBottomSheet.jsx
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import JobDetail from './JobDetail'

const JobBottomSheet = ({ job, onClose, onApply, onApplyExternal }) => {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!job) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/40 z-40'
        onClick={onClose}
      />
      {/* Sheet */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]'>
        {/* Drag handle + close */}
        <div className='flex items-center justify-between px-4 pt-3 pb-2'>
          <div className='w-10 h-1 bg-gray-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3' />
          <div />
          <button onClick={onClose} className='p-1.5 rounded-full hover:bg-gray-100 text-gray-500'>
            <X className='size-5' />
          </button>
        </div>
        {/* Detail content */}
        <div className='flex-1 overflow-y-auto px-4 pb-6'>
          <JobDetail job={job} onApply={onApply} onApplyExternal={onApplyExternal} />
        </div>
      </div>
    </>
  )
}

export default JobBottomSheet
```

- [ ] **Step 2: Verify file saved**

- [ ] **Step 3: Commit new components**

```bash
git add client/src/components/JobRow.jsx client/src/components/JobDetail.jsx client/src/components/JobBottomSheet.jsx
git commit -m "feat: add JobRow, JobDetail, JobBottomSheet components"
```

---

## Chunk 2: Redesign `Jobs.jsx`

### Task 4: Rewrite `Jobs.jsx`

The current `Jobs.jsx` uses swipe state and `SwipeContainer`. Replace the render section while keeping all fetch/filter/apply logic intact.

**Files:**
- Modify: `client/src/pages/Jobs.jsx`

- [ ] **Step 1: Replace the file**

```jsx
// client/src/pages/Jobs.jsx
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setJobs, setJobsLoading, setJobsError, setFilters } from '../app/features/jobsSlice'
import { setCurrentApplication, clearCurrentApplication } from '../app/features/applicationsSlice'
import JobRow from '../components/JobRow'
import JobDetail from '../components/JobDetail'
import JobBottomSheet from '../components/JobBottomSheet'
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

  const [selectedJob, setSelectedJob] = useState(null)
  const [sheetJob, setSheetJob] = useState(null)        // mobile bottom sheet
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
      // Auto-select first job
      if (data.jobs.length > 0) setSelectedJob(data.jobs[0])
    } catch (err) {
      dispatch(setJobsError(err.response?.data?.message || 'Failed to fetch jobs'))
      toast.error(err.response?.data?.message || 'Failed to fetch jobs')
    }
  }

  useEffect(() => {
    checkEmailStatus()
    fetchJobs()
  }, [])

  // Keep selectedJob in sync if feed changes (e.g. after filter)
  useEffect(() => {
    if (feed.length > 0 && !feed.find(j => j._id === selectedJob?._id)) {
      setSelectedJob(feed[0])
    }
  }, [feed])

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

  const handleApply = async (job) => {
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
      setPreviewData({ application: data.application, resume: data.resume, job: data.job })
      dispatch(setCurrentApplication(data.application))
    } catch (err) {
      toast.dismiss('preparing')
      toast.error(err.response?.data?.message || 'Failed to prepare application')
    }
  }

  const handleApplyExternal = (job) => {
    if (job.applyUrl) window.open(job.applyUrl, '_blank', 'noopener')
  }

  const handleJobClick = (job) => {
    // On mobile (sheet), on desktop (panel)
    if (window.innerWidth < 768) {
      setSheetJob(job)
    } else {
      setSelectedJob(job)
    }
  }

  return (
    <>
      <SEO
        title="Job Feed - Find & Apply to Jobs | Flower Resume"
        description="Browse personalized job suggestions and apply with AI-tailored resumes."
      />

      <div className='max-w-7xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]'>

        {/* Email warning */}
        {!checkingEmail && !emailConnected && (
          <div className='mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 shrink-0'>
            <AlertCircle className='size-5 text-amber-500 shrink-0' />
            <div className='flex-1'>
              <p className='text-sm text-amber-800 font-medium'>Email not connected</p>
              <p className='text-xs text-amber-600 mt-0.5'>Connect Gmail or Outlook to send applications directly.</p>
            </div>
            <Link
              to='/app/profile'
              className='px-3 py-1.5 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-1.5 shrink-0'
            >
              <Mail className='size-4' />
              Connect
            </Link>
          </div>
        )}

        {/* Filter Bar */}
        <div className='mb-4 shrink-0'>
          <div className='flex items-center gap-3 flex-wrap'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
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
                    <Search className='size-3' />{filters.keyword}
                  </span>
                )}
                {filters.location && (
                  <span className='inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full'>
                    <MapPin className='size-3' />{filters.location}
                  </span>
                )}
                {filters.type && (
                  <span className='inline-flex items-center gap-1 text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full'>
                    <Briefcase className='size-3' />{filters.type}
                  </span>
                )}
                <button onClick={handleClearFilters} className='text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1'>
                  <X className='size-3' />Clear all
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
                      className='w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                      className='w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                      className='w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white'
                    >
                      <option value=''>All Types</option>
                      <option value='remote'>Remote</option>
                      <option value='onsite'>On-site</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className='flex justify-end gap-2 mt-4'>
                <button onClick={handleClearFilters} className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800'>Clear</button>
                <button onClick={handleApplyFilters} className='px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className='mb-4 bg-red-50 border border-red-200 rounded-xl p-4 shrink-0'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}

        {/* Two-panel layout */}
        {loading ? (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3' />
              <p className='text-gray-500 text-sm'>Finding jobs for you...</p>
            </div>
          </div>
        ) : feed.length === 0 ? (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <Briefcase className='size-12 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-500 font-medium'>No jobs found</p>
              <p className='text-gray-400 text-sm mt-1'>Try updating your filters or check back later</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex gap-4 min-h-0'>
            {/* Left: job list */}
            <div className='w-80 shrink-0 overflow-y-auto flex flex-col gap-2 pr-1'>
              {feed.map(job => (
                <JobRow
                  key={job._id}
                  job={job}
                  selected={selectedJob?._id === job._id}
                  onClick={() => handleJobClick(job)}
                />
              ))}
            </div>

            {/* Right: detail panel (desktop only) */}
            <div className='hidden md:flex flex-1 bg-white border border-gray-200 rounded-xl p-6 overflow-hidden'>
              <JobDetail
                job={selectedJob}
                onApply={() => handleApply(selectedJob)}
                onApplyExternal={() => handleApplyExternal(selectedJob)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {sheetJob && (
        <JobBottomSheet
          job={sheetJob}
          onClose={() => setSheetJob(null)}
          onApply={() => { setSheetJob(null); handleApply(sheetJob) }}
          onApplyExternal={() => { handleApplyExternal(sheetJob); setSheetJob(null) }}
        />
      )}

      {/* Application preview modal */}
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
          onSent={() => {
            dispatch(clearCurrentApplication())
            setPreviewData(null)
            toast.success('Application sent!')
          }}
        />
      )}
    </>
  )
}

export default Jobs
```

- [ ] **Step 2: Verify in browser** — open `/app/jobs`, confirm:
  - Job list renders on the left
  - Clicking a job updates the right panel
  - Filters still work
  - Apply button opens the modal

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Jobs.jsx
git commit -m "feat: redesign Jobs page with list+detail panel layout"
```

---

## Chunk 3: Cleanup

### Task 5: Remove old swipe components and dependency

**Files:**
- Delete: `client/src/components/SwipeContainer.jsx`
- Delete: `client/src/components/JobCard.jsx`
- Modify: `client/package.json`

- [ ] **Step 1: Delete SwipeContainer and JobCard**

```bash
rm client/src/components/SwipeContainer.jsx
rm client/src/components/JobCard.jsx
```

- [ ] **Step 2: Remove react-tinder-card from package.json**

In `client/package.json`, remove the line:
```json
"react-tinder-card": "^1.6.4",
```

- [ ] **Step 3: Uninstall the package**

```bash
cd client && npm uninstall react-tinder-card
```

- [ ] **Step 4: Verify build still works**

```bash
cd client && npm run build
```

Expected: build completes with no errors.

- [ ] **Step 5: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove SwipeContainer, JobCard, and react-tinder-card"
```

---

## Manual Verification Checklist

After all tasks are done, verify the following in the browser:

- [ ] Desktop: two-panel layout visible — list on left, detail on right
- [ ] Desktop: clicking a job row highlights it and updates the right panel
- [ ] Desktop: first job is auto-selected on page load
- [ ] Mobile (resize to <768px): only list shows; tapping a job opens bottom sheet
- [ ] Mobile: bottom sheet closes on backdrop tap and X button
- [ ] Filters: keyword/location/type filters work and update the list
- [ ] Apply: "Apply with AI Resume" opens ApplicationPreview modal correctly
- [ ] External apply: "Apply on Company Site" opens job URL in new tab
- [ ] Empty state: clearing all data shows the "No jobs found" state
- [ ] Loading state: spinner shows while fetching
