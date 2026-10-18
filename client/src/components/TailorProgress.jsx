import { CheckIcon, LoaderCircleIcon } from 'lucide-react'
import React from 'react'

// Stage ids sent by the server's /api/ai/tailor-resume-stream endpoint, in order
const STEPS = [
  { stage: 'profile', label: 'Reading your profile' },
  { stage: 'analyzing', label: 'Analyzing the job description' },
  { stage: 'summary', label: 'Writing your summary' },
  { stage: 'experience', label: 'Tailoring your experience' },
  { stage: 'projects', label: 'Picking the most relevant projects' },
  { stage: 'finishing', label: 'Adding education and extras' },
  { stage: 'saving', label: 'Saving your resume' },
]

const TailorProgress = ({ stage, retrying }) => {
  const currentIndex = Math.max(0, STEPS.findIndex(step => step.stage === stage))

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-4' aria-live='polite'>
      <p className='text-sm font-semibold text-slate-800 mb-3'>Creating your tailored resume…</p>
      <ol className='space-y-2'>
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex
          const isActive = index === currentIndex
          return (
            <li key={step.stage} className={`flex items-center gap-2 text-sm ${isDone ? 'text-green-700' : isActive ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
              <span className='size-5 flex items-center justify-center shrink-0'>
                {isDone ? <CheckIcon className='size-4' /> : isActive ? <LoaderCircleIcon className='size-4 animate-spin text-amber-600' /> : <span className='size-1.5 rounded-full bg-slate-300' />}
              </span>
              {step.label}
            </li>
          )
        })}
      </ol>
      {retrying && (
        <p className='text-xs text-amber-700 mt-3'>The AI's first answer was incomplete — trying again.</p>
      )}
      <div className='mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
        <div className='h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-500' style={{ width: `${((currentIndex + 0.5) / STEPS.length) * 100}%` }} />
      </div>
    </div>
  )
}

export default TailorProgress
