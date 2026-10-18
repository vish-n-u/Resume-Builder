import { useEffect, useRef, useState } from 'react'
import api from '../../configs/api'

const AUTOSAVE_DELAY_MS = 3000

// Snapshot used to tell whether there is anything new to save. A newly picked image (a File)
// can't be compared by content, so it always counts as a change.
const serializeForSave = (data) => {
  const image = data.personal_info?.image
  const pendingImage = image && typeof image === 'object'
  return JSON.stringify({
    ...data,
    personal_info: { ...data.personal_info, image: pendingImage ? `pending:${image.name}:${image.lastModified}` : image }
  })
}

// Saving for the resume builder: debounced autosave of real changes only, saves queued in order,
// pending edits flushed when the builder closes, and a warning before closing the tab with unsaved work.
const useResumeSave = ({ resumeId, token, resumeData, setResumeData }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('') // '', 'saving', 'saved', 'error'

  const saveTimeoutRef = useRef(null)
  const lastSavedRef = useRef(null) // serialized copy of what the server last saved
  const saveQueueRef = useRef(Promise.resolve()) // saves run one at a time, in order
  const resumeDataRef = useRef(resumeData)
  resumeDataRef.current = resumeData

  // Call with data that came from the server so it isn't immediately saved back
  const markSaved = (data) => {
    lastSavedRef.current = serializeForSave(data)
  }

  const hasUnsavedChanges = (data) => !!data._id && serializeForSave(data) !== lastSavedRef.current

  // Sends the resume to the server. Saves are queued so responses can't arrive out of order.
  const persistResume = (data) => {
    const run = async () => {
      const pendingImage = data.personal_info?.image
      const hasNewImage = pendingImage && typeof pendingImage === 'object'

      const payload = structuredClone(data)
      if (hasNewImage) delete payload.personal_info.image

      const formData = new FormData();
      formData.append("resumeId", resumeId)
      formData.append('resumeData', JSON.stringify(payload))
      hasNewImage && formData.append("image", pendingImage)

      const { data: response } = await api.put('/api/resumes/update', formData, {headers: { Authorization: token }})

      const saved = { ...data }
      if (hasNewImage) {
        // Swap the uploaded File for its URL so the image isn't uploaded again on the next save
        const imageUrl = response.resume?.personal_info?.image || ''
        saved.personal_info = { ...data.personal_info, image: imageUrl }
        setResumeData(prev => prev.personal_info?.image === pendingImage
          ? { ...prev, personal_info: { ...prev.personal_info, image: imageUrl } }
          : prev)
      }
      markSaved(saved)
      return response
    }

    const result = saveQueueRef.current.then(run, run)
    saveQueueRef.current = result.catch(() => {})
    return result
  }

  // Silent save used by the debounce timer
  const autoSave = async () => {
    try {
      setAutoSaveStatus('saving')
      await persistResume(resumeDataRef.current)
      setAutoSaveStatus('saved')

      // Clear the "saved" status after 2 seconds
      setTimeout(() => setAutoSaveStatus(status => status === 'saved' ? '' : status), 2000)
    } catch (error) {
      console.error("Error auto-saving resume:", error)
      setAutoSaveStatus('error')
    }
  }

  // Explicit save (Save button); cancels any pending autosave
  const saveNow = async () => {
    clearTimeout(saveTimeoutRef.current)
    const response = await persistResume(resumeDataRef.current)
    setAutoSaveStatus('')
    return response
  }

  // Autosave after a pause in editing, only if something changed
  useEffect(() => {
    if (!hasUnsavedChanges(resumeData)) return

    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null
      autoSave()
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(saveTimeoutRef.current)
  }, [resumeData])

  // Save pending edits when leaving the builder, and warn before closing the tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges(resumeDataRef.current)) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (hasUnsavedChanges(resumeDataRef.current)) {
        persistResume(resumeDataRef.current).catch(error => console.error("Error saving resume on exit:", error))
      }
    }
  }, [])

  return { autoSaveStatus, persistResume, saveNow, markSaved }
}

export default useResumeSave
