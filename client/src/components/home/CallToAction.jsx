import React from 'react'

const CallToAction = () => {
  return (
    <div id='cta' className='border-y border-dashed border-slate-200 w-full max-w-5xl mx-auto px-4 sm:px-10 md:px-16 mt-20 sm:mt-28'>
            <div className="flex flex-col md:flex-row text-center md:text-left items-center justify-between gap-6 sm:gap-8 px-3 md:px-10 border-x border-dashed border-slate-200 py-12 sm:py-16 md:py-20 -mt-10 -mb-10 w-full">
                <p className="text-lg sm:text-xl font-medium max-w-md text-slate-800">Stop sending generic resumes. Let AI match your skills to every opportunity.</p>
                <a href="/app" className="flex items-center gap-2 rounded py-3 px-8 bg-yellow-600 hover:bg-yellow-700 transition text-white text-sm sm:text-base active:scale-95">
                    <span>Get Started</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
            </div>
        </div>
  )
}

export default CallToAction
