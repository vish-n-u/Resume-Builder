import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, LoaderCircleIcon, RefreshCw, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../configs/api'
import { computeJobMatch } from '../../utils/jdMatch'

const scoreStyle = (score) => {
  if (score >= 75) return { label: 'Strong match', bar: 'bg-green-500', text: 'text-green-700' }
  if (score >= 50) return { label: 'Fair match', bar: 'bg-amber-500', text: 'text-amber-700' }
  return { label: 'Low match', bar: 'bg-red-500', text: 'text-red-700' }
}

const KeywordChips = ({ keywords, className }) => (
  <div className='flex flex-wrap gap-1.5'>
    {keywords.map(keyword => (
      <span key={keyword.term} className={`px-2 py-0.5 rounded-full text-xs border ${className}`}>
        {keyword.term}{keyword.importance === 'preferred' && <span className='opacity-60'> · nice to have</span>}
      </span>
    ))}
  </div>
)

// Shows how well the resume covers the job description's keywords. Keywords are extracted by AI once
// per job description (cached on the server); the score itself is recomputed live as the resume changes.
const JobMatchPanel = ({ resumeId, token, resumeData, profileData }) => {
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const analyze = async (force = false) => {
    setIsAnalyzing(true)
    setError('')
    try {
      const { data } = await api.post('/api/ai/analyze-jd', { resumeId, force }, { headers: { Authorization: token } })
      setAnalysis(data.jd_analysis)
    } catch (err) {
      const message = err?.response?.data?.message || 'Could not analyze the job description'
      setError(message)
      if (force) toast.error(message)
    }
    setIsAnalyzing(false)
  }

  // Once the resume loads, use its saved analysis, or ask the server for one (the server also
  // re-extracts if the job description changed since the saved analysis)
  useEffect(() => {
    if (!resumeId || !resumeData._id || !resumeData.job_description?.trim()) return
    if (resumeData.jd_analysis?.keywords?.length) setAnalysis(resumeData.jd_analysis)
    else analyze(false)
  }, [resumeData._id, resumeData.job_description])

  const match = useMemo(
    () => analysis ? computeJobMatch(analysis.keywords, resumeData, profileData) : null,
    [analysis, resumeData, profileData]
  )

  if (!resumeData.job_description?.trim()) return null

  if (!match) {
    return (
      <div className='mb-3 bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-gray-600'>
        {isAnalyzing ? (
          <><LoaderCircleIcon className='size-4 animate-spin text-amber-600' /> Checking how well this resume matches the job…</>
        ) : (
          <>
            <Target className='size-4 text-gray-400' />
            <span className='flex-1'>{error || 'Job match not available yet.'}</span>
            <button onClick={() => analyze(true)} className='text-xs font-medium text-amber-700 hover:underline'>Try again</button>
          </>
        )}
      </div>
    )
  }

  const style = scoreStyle(match.score)
  const total = match.matched.length + match.inProfileOnly.length + match.missing.length

  return (
    <div className='mb-3 bg-white border border-gray-200 rounded-lg shadow-sm'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className='w-full flex items-center gap-3 px-4 py-3 text-left'
      >
        <Target className={`size-5 shrink-0 ${style.text}`} />
        <div className='flex-1 min-w-0'>
          <div className='flex items-baseline justify-between gap-2'>
            <p className='text-sm font-semibold text-gray-900'>
              Job match: <span className={style.text}>{match.score}%</span>
              <span className={`ml-2 text-xs font-medium ${style.text}`}>{style.label}</span>
            </p>
            <p className='text-xs text-gray-500 whitespace-nowrap'>{match.matched.length} of {total} keywords</p>
          </div>
          <div className='mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
            <div className={`h-full ${style.bar} transition-all duration-500`} style={{ width: `${match.score}%` }} />
          </div>
        </div>
        {isExpanded ? <ChevronUp className='size-4 text-gray-400' /> : <ChevronDown className='size-4 text-gray-400' />}
      </button>

      {isExpanded && (
        <div className='px-4 pb-4 space-y-3 border-t border-gray-100 pt-3'>
          {match.inProfileOnly.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-amber-800 mb-1.5'>In your profile, but not on this resume — easy wins</p>
              <KeywordChips keywords={match.inProfileOnly} className='bg-amber-50 border-amber-200 text-amber-800' />
              <p className='text-[11px] text-gray-500 mt-1'>Add these to a relevant section, or check whether a hidden section contains them.</p>
            </div>
          )}

          {match.missing.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-gray-700 mb-1.5'>Not in your profile</p>
              <KeywordChips keywords={match.missing} className='bg-gray-50 border-gray-200 text-gray-600' />
              <p className='text-[11px] text-gray-500 mt-1'>Only add these if you genuinely have the experience — then add them to your profile too.</p>
            </div>
          )}

          {match.matched.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-green-800 mb-1.5'>Already on your resume</p>
              <KeywordChips keywords={match.matched} className='bg-green-50 border-green-200 text-green-800' />
            </div>
          )}

          <div className='flex items-center justify-between pt-1'>
            <p className='text-[11px] text-gray-500'>Required keywords count double. Hidden sections don't count.</p>
            <button
              onClick={() => analyze(true)}
              disabled={isAnalyzing}
              className='flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50'
            >
              <RefreshCw className={`size-3 ${isAnalyzing ? 'animate-spin' : ''}`} /> Re-analyze job
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobMatchPanel
