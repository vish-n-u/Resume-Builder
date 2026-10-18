import React, { useState } from 'react'
import { Loader2, RefreshCw, Undo2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import api from '../configs/api'

// "Regenerate" for one part of a tailored resume: asks the AI for a fresh version written for the
// resume's job description, applies it, and offers Undo back to the text it replaced.
// section: 'summary' | 'experience' | 'project'; item: the experience/project entry (not needed for summary)
const RegenerateButton = ({ section, item, currentText, jobDescription, onApply, size = 'sm' }) => {
  const { token } = useSelector(state => state.auth)
  const [isLoading, setIsLoading] = useState(false)
  const [previousText, setPreviousText] = useState(null)

  if (!jobDescription?.trim()) return null

  const regenerate = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/api/ai/regenerate-section',
        { section, item, currentText, jobDescription },
        { headers: { Authorization: token } }
      )
      // Keep the version from before the first regenerate, so Undo always returns to the user's own text
      setPreviousText(prev => prev ?? (currentText || ''))
      onApply(data.text)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const undo = () => {
    onApply(previousText)
    setPreviousText(null)
  }

  const sizing = size === 'xs' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
  const icon = size === 'xs' ? 'w-3 h-3' : 'size-4'

  return (
    <>
      <button
        onClick={regenerate}
        disabled={isLoading}
        title='Write a new version tailored to this job, using only your real data'
        className={`flex items-center gap-1 ${sizing} bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
      >
        {isLoading ? <Loader2 className={`${icon} animate-spin`}/> : <RefreshCw className={icon}/>}
        {isLoading ? 'Writing...' : 'Regenerate'}
      </button>
      {previousText !== null && !isLoading && (
        <button
          onClick={undo}
          title='Go back to the text from before you regenerated'
          className={`flex items-center gap-1 ${sizing} text-gray-600 rounded hover:bg-gray-100 transition-colors shrink-0`}
        >
          <Undo2 className={icon}/> Undo
        </button>
      )}
    </>
  )
}

export default RegenerateButton
