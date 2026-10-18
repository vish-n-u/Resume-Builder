import React, { useEffect, useMemo, useRef, useState } from 'react'
import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate'
import MinimalTemplate from './templates/MinimalTemplate'
import MinimalImageTemplate from './templates/MinimalImageTemplate'
import CompactTemplate from './templates/CompactTemplate'
import { sanitizeResumeData } from '../utils/sanitize'

// US Letter width at 96dpi. On narrow screens the resume is laid out at this width
// and scaled down to fit, so phones show the same layout as the printed PDF.
const PAGE_WIDTH = 816
const SCALE_BELOW = 640

// Returns the scale factor and the scaled height for the page inside containerRef
const useFitToWidth = (containerRef, pageRef) => {
    const [fit, setFit] = useState({ scale: 1, height: null })

    useEffect(() => {
        const container = containerRef.current
        const page = pageRef.current
        if (!container || !page || typeof ResizeObserver === 'undefined') return

        const update = () => {
            const width = container.clientWidth
            if (width >= SCALE_BELOW) {
                setFit({ scale: 1, height: null })
                return
            }
            const scale = width / PAGE_WIDTH
            setFit({ scale, height: page.offsetHeight * scale })
        }

        const observer = new ResizeObserver(update)
        observer.observe(container)
        observer.observe(page)
        return () => observer.disconnect()
    }, [containerRef, pageRef])

    return fit
}

const ResumePreview = ({data: rawData, template, accentColor, classes = ""}) => {

    const containerRef = useRef(null)
    const pageRef = useRef(null)
    const { scale, height } = useFitToWidth(containerRef, pageRef)
    const isScaled = scale !== 1

    const data = useMemo(() => sanitizeResumeData(rawData), [rawData])

    const sectionVisibility = data?.sectionVisibility || {
        summary: true,
        experience: true,
        education: true,
        projects: true,
        skills: true,
        certifications: true,
        achievements: true,
        customSections: true,
    }

    const renderTemplate = ()=>{
        switch (template) {
            case "modern":
                return <ModernTemplate data={data} accentColor={accentColor} sectionVisibility={sectionVisibility} sectionOrder={data?.section_order}/>;
            case "minimal":
                return <MinimalTemplate data={data} accentColor={accentColor} sectionVisibility={sectionVisibility} sectionOrder={data?.section_order}/>;
            case "minimal-image":
                return <MinimalImageTemplate data={data} accentColor={accentColor} sectionVisibility={sectionVisibility} sectionOrder={data?.section_order}/>;
            case "compact":
                return <CompactTemplate data={data} accentColor={accentColor} sectionVisibility={sectionVisibility} sectionOrder={data?.section_order}/>;

            default:
                return <ClassicTemplate data={data} accentColor={accentColor} sectionVisibility={sectionVisibility} sectionOrder={data?.section_order}/>;
        }
    }

  return (
    <div ref={containerRef} className='w-full bg-gray-100 print:bg-white print:m-0 print:p-0 print:h-auto! overflow-hidden' style={isScaled ? { height } : undefined}>
      <div
        ref={pageRef}
        className='resume-scale'
        style={isScaled ? { width: PAGE_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' } : undefined}
      >
        <div id="resume-preview" className={"border border-gray-200 print:shadow-none print:border-none print:m-0 print:p-0 max-w-full overflow-hidden " + classes}>
          {renderTemplate()}
        </div>
      </div>

      <style>
        {`
        @page {
          size: letter;
          margin: 0;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Undo the on-screen fit-to-width scaling */
          .resume-scale {
            transform: none !important;
            width: auto !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: auto;
          }

          /* Hide everything except resume */
          body * {
            visibility: hidden;
          }

          #resume-preview,
          #resume-preview * {
            visibility: visible;
          }

          #resume-preview {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            display: block;
            width: 100%;
            height: auto;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }

          /* Prevent awkward breaks */
          #resume-preview h1,
          #resume-preview h2,
          #resume-preview h3 {
            page-break-after: avoid;
          }

          /* Keep experience/project/education items together when possible */
          #resume-preview .experience-item,
          #resume-preview .project-item,
          #resume-preview .education-item {
            page-break-inside: avoid;
          }
        }
        `}
      </style>
    </div>
  )
}

export default ResumePreview
