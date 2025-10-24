import { Zap } from 'lucide-react';
import React from 'react'
import Title from './Title';

const Features = () => {
    const [isHover, setIsHover] = React.useState(false);
  return (
    <section id='features' className='flex flex-col items-center my-10 scroll-mt-12' aria-labelledby="features-heading">

    <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-400/10 rounded-full px-6 py-1.5">
        <Zap width={14} aria-hidden="true"/>
        <span>Simple Process</span>
    </div>
    <Title title='How Flower Resume Works' description='Just three simple steps to get your perfectly tailored, AI-powered resume that matches any job requirement.'/>

            <div className="flex flex-col md:flex-row items-center xl:-mt-10">
                <img className="max-w-2xl w-full xl:-ml-32" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/group-image-1.png" alt="Resume builder interface showing professional templates and customization options" loading="lazy" />
                <article className="px-4 md:px-0" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                    <div className={"flex items-center justify-center gap-6 max-w-md group cursor-pointer"}>
                        <div className={`p-6 group-hover:bg-yellow-100 border border-transparent group-hover:border-yellow-300  flex gap-4 rounded-xl transition-colors ${!isHover ? 'border-yellow-300 bg-yellow-100' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-yellow-600"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">1. Enter Your Details</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Provide your professional information as detailed as possible - skills, experience, education, and achievements.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-amber-100 border border-transparent group-hover:border-amber-300 flex gap-4 rounded-xl transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-amber-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">2. Paste Job Description</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Simply copy and paste the job description from any posting you're interested in applying for.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-yellow-100 border border-transparent group-hover:border-yellow-300 flex gap-4 rounded-xl transition-colors">
                            <svg className="size-6 stroke-yellow-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">3. AI Creates Perfect Resume</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Our AI analyzes both inputs and generates a tailored resume that perfectly matches the job requirements.</p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
        </section>
  )
}

export default Features
