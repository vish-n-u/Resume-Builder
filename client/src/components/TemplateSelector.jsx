import { Check, Layout } from 'lucide-react'
import React, { useState } from 'react'

const TemplateSelector = ({ selectedTemplate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)

    const templates = [
        {
            id: "classic",
            name: "Classic",
            preview: "A clean, traditional resume format with clear sections and professional typography"
        },
        {
            id: "modern",
            name: "Modern",
            preview: "Sleek design with strategic use of color and modern font choices"
        },
        {
            id: "minimal-image",
            name: "Minimal Image",
            preview: "Minimal design with a single image and clean typography"
        },
            {
            id: "minimal",
            name: "Minimal",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "compact",
            name: "Compact",
            preview: "Space-efficient two-column layout perfect for fitting more content on one page"
        },
    ]
  return (
    <div className='relative flex-1 sm:flex-initial'>
      <button onClick={()=> setIsOpen(!isOpen)} className='flex items-center justify-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 active:scale-95 transition-all px-3 py-2 rounded-lg group w-full sm:w-auto' title='Change resume template'>
        <Layout size={16} className='group-hover:rotate-12 transition-transform' /> <span>Template</span>
      </button>
      {isOpen && (
        <>
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)}></div>
        <div className='absolute top-full w-72 p-4 mt-2 space-y-3 z-50 bg-white rounded-lg border border-blue-200 shadow-xl'>
            <div className='mb-3 pb-3 border-b border-gray-200'>
                <h3 className='text-sm font-bold text-gray-800 mb-1'>Choose Resume Template</h3>
                <p className='text-xs text-gray-500'>Select a layout style for your resume</p>
            </div>
            {templates.map((template)=>(
                <div key={template.id} onClick={()=> {onChange(template.id); setIsOpen(false)}} className={`relative p-3 border rounded-md cursor-pointer transition-all ${selectedTemplate === template.id ?
                    "border-blue-400 bg-blue-100"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-100"
                }`}>
                    {selectedTemplate === template.id && (
                        <div className="absolute top-2 right-2">
                            <div className='size-5 bg-blue-400 rounded-full flex items-center justify-center'>
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <h4 className='font-medium text-gray-800'>{template.name}</h4>
                        <div className='mt-2 p-2 bg-blue-50 rounded text-xs text-gray-500 italic'>{template.preview}</div>
                    </div>
                </div>
            ))}
        </div>
        </>
      )}
    </div>
  )
}

export default TemplateSelector
