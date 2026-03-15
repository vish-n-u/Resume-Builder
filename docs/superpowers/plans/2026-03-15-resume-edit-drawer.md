# Resume Edit Drawer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a quick-edit drawer to the ApplicationPreview modal so users can edit their tailored resume's Summary, Experience descriptions, and Skills without leaving the apply flow.

**Architecture:** A new `ResumeEditDrawer` component slides in over the resume preview inside the modal. `ApplicationPreview` lifts `resume` from a prop to local state — edits from the drawer update this state (live preview) and call `PUT /api/resumes/update` on blur to persist. No new API endpoints needed.

**Tech Stack:** React 18, Tailwind CSS, Lucide React, existing `PUT /api/resumes/update` endpoint (`{ resumeId, resumeData }`)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `client/src/components/ResumeEditDrawer.jsx` | Drawer panel with Summary, Experience, Skills editors |
| Modify | `client/src/components/ApplicationPreview.jsx` | Lift resume to state, wire drawer open/close, save on blur |

---

## Chunk 1: ResumeEditDrawer component

### Task 1: Create `ResumeEditDrawer.jsx`

**Files:**
- Create: `client/src/components/ResumeEditDrawer.jsx`

- [ ] **Step 1: Create the file**

```jsx
// client/src/components/ResumeEditDrawer.jsx
import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

const ResumeEditDrawer = ({ resume, onChange, onBlur, onClose }) => {
  const [newSkill, setNewSkill] = useState('')

  const handleSummaryChange = (e) => {
    onChange('professional_summary', e.target.value)
  }

  const handleSummaryBlur = () => {
    onBlur()
  }

  const handleExperienceChange = (index, value) => {
    const updated = resume.experience.map((exp, i) =>
      i === index ? { ...exp, description: value } : exp
    )
    onChange('experience', updated)
  }

  const handleExperienceBlur = () => {
    onBlur()
  }

  const handleAddSkill = () => {
    const skill = newSkill.trim()
    if (!skill) return
    if (resume.skills.includes(skill)) return
    onChange('skills', [...resume.skills, skill])
    setNewSkill('')
    onBlur()
  }

  const handleRemoveSkill = (skill) => {
    onChange('skills', resume.skills.filter(s => s !== skill))
    onBlur()
  }

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/20 z-10' onClick={onClose} />

      {/* Drawer */}
      <div className='absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white z-20 flex flex-col shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0'>
          <h3 className='text-base font-semibold text-gray-900'>Edit Resume</h3>
          <button
            onClick={onClose}
            className='p-1.5 hover:bg-gray-100 rounded-lg text-gray-500'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto px-5 py-4 space-y-6'>

          {/* Professional Summary */}
          <div>
            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
              Professional Summary
            </label>
            <textarea
              value={resume.professional_summary || ''}
              onChange={handleSummaryChange}
              onBlur={handleSummaryBlur}
              rows={5}
              className='w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              placeholder='Write a compelling summary...'
            />
          </div>

          {/* Experience */}
          {resume.experience?.length > 0 && (
            <div>
              <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                Experience
              </label>
              <div className='space-y-4'>
                {resume.experience.map((exp, index) => (
                  <div key={index}>
                    <p className='text-sm font-medium text-gray-800 mb-0.5'>
                      {exp.position}
                    </p>
                    <p className='text-xs text-gray-500 mb-1.5'>{exp.company}</p>
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => handleExperienceChange(index, e.target.value)}
                      onBlur={handleExperienceBlur}
                      rows={4}
                      className='w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                      placeholder='Describe your responsibilities and achievements...'
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
              Skills
            </label>
            <div className='flex flex-wrap gap-1.5 mb-3'>
              {(resume.skills || []).map((skill) => (
                <span
                  key={skill}
                  className='inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md'
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className='hover:text-blue-900 ml-0.5'
                  >
                    <X className='size-3' />
                  </button>
                </span>
              ))}
            </div>
            <div className='flex gap-2'>
              <input
                type='text'
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder='Add a skill...'
                className='flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button
                onClick={handleAddSkill}
                className='px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus className='size-4' />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className='px-5 py-3 border-t border-gray-100 shrink-0'>
          <p className='text-xs text-gray-400 text-center'>Changes save automatically</p>
        </div>
      </div>
    </>
  )
}

export default ResumeEditDrawer
```

- [ ] **Step 2: Verify file saved — no syntax errors**

- [ ] **Step 3: Commit**

```bash
git add client/src/components/ResumeEditDrawer.jsx
git commit -m "feat: add ResumeEditDrawer component"
```

---

## Chunk 2: Wire drawer into ApplicationPreview

### Task 2: Modify `ApplicationPreview.jsx`

**Files:**
- Modify: `client/src/components/ApplicationPreview.jsx`

Four changes to make:

**Change A** — lift `resume` prop to state and add `showDrawer` state. Add `savingResume` state for error handling.

**Change B** — add `handleResumeChange` and `handleResumeBlur` handlers.

**Change C** — add "Edit Resume" button to the resume tab header.

**Change D** — render `ResumeEditDrawer` conditionally inside the modal.

- [ ] **Step 1: Add import for ResumeEditDrawer**

At the top of `ApplicationPreview.jsx`, add:
```js
import ResumeEditDrawer from './ResumeEditDrawer'
```

- [ ] **Step 2: Lift resume to state and add showDrawer**

Find the existing state declarations at the top of the component (after `const [sending, setSending] = useState(false)`). Add these:

```js
// Lift resume prop to local state so drawer edits update the preview live
const [resumeData, setResumeData] = useState(resume)
const [showDrawer, setShowDrawer] = useState(false)
```

Also add a `useEffect` after the state declarations to keep `resumeData` in sync if the parent re-passes a new resume prop:

```js
useEffect(() => {
  setResumeData(resume)
}, [resume])
```

`useEffect` is already imported at the top of the file (it's a React import). If it isn't, add it to the React import line.

- [ ] **Step 3: Add save handler**

After the existing `handleSave` function, add:

```js
const handleResumeChange = (field, value) => {
  setResumeData(prev => ({ ...prev, [field]: value }))
}

const handleResumeBlur = async () => {
  try {
    // Endpoint requires FormData (same pattern as ResumeBuilder)
    const formData = new FormData()
    formData.append('resumeId', resumeData._id)
    formData.append('resumeData', JSON.stringify(resumeData))
    await api.put('/api/resumes/update', formData, { headers: { Authorization: token } })
  } catch {
    toast.error('Failed to save resume changes')
  }
}
```

- [ ] **Step 4: Add Edit Resume button to the resume tab**

Find the resume tab content section (around line 300–308):
```jsx
          ) : (
            <div ref={resumeRef}>
              <ResumePreview
```

Replace with:
```jsx
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
```

Note: `Edit3` is already imported in `ApplicationPreview.jsx`.

- [ ] **Step 5: Update ResumePreview to use resumeData state**

Find the `ResumePreview` usage (inside the resume tab, just below the edit button):
```jsx
              <ResumePreview
                data={resume}
```

Change `data={resume}` to `data={resumeData}`.

Also update the `handleDownloadResume` function — it reads from `resumeRef` which wraps `ResumePreview`, so no change needed there. The print window captures whatever is rendered, which will reflect `resumeData`.

- [ ] **Step 6: Render the drawer inside the modal**

Find the closing `</div>` of the modal container (the one with `relative bg-white rounded-2xl` class, around line 189). Just before the closing `</div>` of that container, add:

```jsx
        {/* Quick-edit drawer */}
        {showDrawer && (
          <ResumeEditDrawer
            resume={resumeData}
            onChange={handleResumeChange}
            onBlur={handleResumeBlur}
            onClose={() => setShowDrawer(false)}
          />
        )}
```

- [ ] **Step 7: Manual verification**

Start the dev server and open the Jobs page:
```bash
cd client && npm run dev
```

Verify:
- [ ] "Edit Resume" button appears on the Resume tab of the ApplicationPreview modal
- [ ] Clicking it opens the drawer from the right
- [ ] Editing the summary updates the resume preview live
- [ ] Editing an experience description updates the preview live
- [ ] Adding/removing a skill updates the preview live
- [ ] Clicking the backdrop or × closes the drawer
- [ ] Changes persist after closing and reopening (saved to DB)
- [ ] A failed save shows a toast error (can test by temporarily breaking the endpoint)

- [ ] **Step 8: Commit**

```bash
git add client/src/components/ApplicationPreview.jsx
git commit -m "feat: wire ResumeEditDrawer into ApplicationPreview modal"
```
