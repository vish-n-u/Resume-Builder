import React, { useState } from 'react'
import { ArrowDown, ArrowUp, EyeIcon, EyeOffIcon, ListOrdered, RotateCcw } from 'lucide-react'
import { DEFAULT_SECTION_ORDER } from '../templates/sectionOrder'
import { BUILDER_SECTIONS } from './sections'

// Saved order completed with any sections it doesn't mention yet
const currentOrder = (sectionOrder) => {
  const saved = Array.isArray(sectionOrder) ? sectionOrder.filter(id => DEFAULT_SECTION_ORDER.includes(id)) : []
  return [...saved, ...DEFAULT_SECTION_ORDER.filter(id => !saved.includes(id))]
}

// List of resume sections with move up/down and show/hide controls
export const SectionOrderList = ({ resumeData, setResumeData }) => {
  const order = currentOrder(resumeData.section_order)
  const isCustomOrder = Array.isArray(resumeData.section_order) && resumeData.section_order.length > 0

  const move = (index, direction) => {
    const next = [...order]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setResumeData(prev => ({ ...prev, section_order: next }))
  }

  const toggleVisibility = (id) => setResumeData(prev => ({
    ...prev,
    sectionVisibility: { ...prev.sectionVisibility, [id]: !prev.sectionVisibility?.[id] }
  }))

  return (
    <div>
      <ol className='space-y-1.5'>
        {order.map((id, index) => {
          const section = BUILDER_SECTIONS.find(s => s.id === id)
          const visible = resumeData.sectionVisibility?.[id] !== false
          return (
            <li key={id} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${visible ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'}`}>
              <span className='w-5 text-xs text-gray-400 tabular-nums'>{index + 1}.</span>
              <span className={`flex-1 text-sm ${visible ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{section?.name || id}</span>
              <button
                onClick={() => toggleVisibility(id)}
                aria-label={visible ? `Hide ${section?.name}` : `Show ${section?.name}`}
                title={visible ? 'Hide on resume' : 'Show on resume'}
                className={`p-1 rounded hover:bg-gray-100 ${visible ? 'text-green-600' : 'text-gray-400'}`}
              >
                {visible ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' />}
              </button>
              <button
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${section?.name} up`}
                className='p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <ArrowUp className='size-4' />
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === order.length - 1}
                aria-label={`Move ${section?.name} down`}
                className='p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <ArrowDown className='size-4' />
              </button>
            </li>
          )
        })}
      </ol>

      <div className='flex items-start justify-between gap-3 mt-3'>
        <p className='text-[11px] text-gray-500 leading-snug'>
          In two-column templates, sections keep to their column; the order applies within each column.
        </p>
        {isCustomOrder && (
          <button
            onClick={() => setResumeData(prev => ({ ...prev, section_order: [] }))}
            className='flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 whitespace-nowrap'
          >
            <RotateCcw className='size-3' /> Reset
          </button>
        )}
      </div>
    </div>
  )
}

// Desktop: "Sections" button next to Template/Accent that opens the list in a popover
export const SectionOrderButton = ({ resumeData, setResumeData }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title='Reorder or hide resume sections'
        className='flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 transition-all px-3 py-2 rounded-lg'
      >
        <ListOrdered size={16} /> <span>Sections</span>
      </button>
      {isOpen && (
        <>
          <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
          <div className='absolute top-full left-0 w-80 p-4 mt-2 z-50 bg-white rounded-lg border border-green-200 shadow-xl'>
            <div className='mb-3 pb-3 border-b border-gray-200'>
              <h3 className='text-sm font-bold text-gray-800 mb-1'>Section order</h3>
              <p className='text-xs text-gray-500'>Change the order sections appear on your resume, or hide them</p>
            </div>
            <SectionOrderList resumeData={resumeData} setResumeData={setResumeData} />
          </div>
        </>
      )}
    </div>
  )
}
