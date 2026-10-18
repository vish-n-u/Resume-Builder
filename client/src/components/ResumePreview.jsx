import React, { useMemo } from 'react'
import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate'
import MinimalTemplate from './templates/MinimalTemplate'
import MinimalImageTemplate from './templates/MinimalImageTemplate'
import CompactTemplate from './templates/CompactTemplate'
import { sanitizeResumeData } from '../utils/sanitize'

const ResumePreview = ({data: rawData, template, accentColor, classes = ""}) => {

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
    <div className='w-full bg-gray-100 print:bg-white print:m-0 print:p-0 overflow-hidden'>
      <div id="resume-preview" className={"border border-gray-200 print:shadow-none print:border-none print:m-0 print:p-0 max-w-full overflow-hidden " + classes}>
        {renderTemplate()}
      </div>

      <style>
        {`
        @page {
          size: letter;
          margin: 0;
        }

        /* Mobile scaling for resume */
        @media (max-width: 640px) {
          #resume-preview {
            transform-origin: top left;
          }
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
