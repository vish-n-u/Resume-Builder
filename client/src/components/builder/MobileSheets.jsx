import React, { useEffect } from 'react'
import { CheckCircle, Sparkles, X } from 'lucide-react'
import { ACCENT_COLORS, TEMPLATES } from '../../configs/resumeOptions'
import { SectionOrderList } from './SectionOrderList'

// Close an open sheet with the Escape key
const useEscapeToClose = (onClose) => {
  useEffect(() => {
    const handleKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])
}

// Full-height drawer that slides up from the bottom on mobile (hidden on desktop)
export const BottomDrawer = ({ header, label, onClose, children }) => {
  useEscapeToClose(onClose)

  return (
    <>
      <div className='fixed inset-0 bg-black/60 z-40 lg:hidden' onClick={onClose} />
      <div role='dialog' aria-modal='true' aria-label={label} className='fixed inset-x-0 bottom-0 bg-white z-50 lg:hidden overflow-hidden flex flex-col rounded-t-2xl shadow-2xl' style={{height: '92vh', maxHeight: '92vh'}}>
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0'>
          {header}
          <button onClick={onClose} aria-label='Close' className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'>
            <X className='size-5' />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto overflow-x-hidden overscroll-contain'>
          {children}
        </div>
      </div>
    </>
  )
}

// Small sheet: bottom sheet on phones, centered dialog on larger screens
const OptionSheet = ({ title, onClose, children }) => {
  useEscapeToClose(onClose)

  return (
    <>
      <div className='fixed inset-0 bg-black/50 z-40 transition-opacity' onClick={onClose} />
      <div role='dialog' aria-modal='true' aria-label={title} className='fixed bottom-0 left-0 right-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-96 bg-white z-50 shadow-2xl rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-hidden flex flex-col'>
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
          <button onClick={onClose} aria-label='Close' className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <X className='size-5' />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

export const SectionOrderSheet = ({ resumeData, setResumeData, onClose }) => (
  <OptionSheet title='Section Order' onClose={onClose}>
    <div className='p-4 overflow-y-auto'>
      <SectionOrderList resumeData={resumeData} setResumeData={setResumeData} />
    </div>
  </OptionSheet>
)

export const TemplateSheet =({ selected, onSelect, onClose }) => (
  <OptionSheet title='Select Template' onClose={onClose}>
    <div className='p-4 space-y-3 overflow-y-auto'>
      {TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => { onSelect(template.id); onClose() }}
          className={`relative block w-full text-left p-3 border rounded-md cursor-pointer transition-all ${
            selected === template.id
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          {selected === template.id && (
            <div className="absolute top-2 right-2">
              <div className='size-5 bg-blue-500 rounded-full flex items-center justify-center'>
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <h4 className='font-medium text-gray-800'>{template.name}</h4>
            <div className='mt-2 p-2 bg-blue-50 rounded text-xs text-gray-600'>{template.preview}</div>
          </div>
        </button>
      ))}
    </div>
  </OptionSheet>
)

export const ColorSheet = ({ selected, onSelect, onClose }) => (
  <OptionSheet title='Select Accent Color' onClose={onClose}>
    <div className='p-4'>
      <div className='grid grid-cols-4 gap-3'>
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.value}
            aria-label={color.name}
            className='relative cursor-pointer group flex flex-col items-center'
            onClick={() => { onSelect(color.value); onClose() }}
          >
            <div
              className="w-14 h-14 rounded-full border-2 border-transparent group-hover:border-gray-400 transition-all"
              style={{backgroundColor: color.value}}
            >
              {selected === color.value && (
                <div className='w-full h-full flex items-center justify-center'>
                  <CheckCircle className="size-6 text-white drop-shadow-md" />
                </div>
              )}
            </div>
            <p className='text-xs text-center mt-1.5 text-gray-600 font-medium'>{color.name}</p>
          </button>
        ))}
      </div>
    </div>
  </OptionSheet>
)

// Floating action button at the bottom right on mobile, expanding into a list of actions.
// actions: [{ label, icon, iconClass, onClick }]
export const MobileActionMenu = ({ isOpen, setIsOpen, actions }) => (
  <div className='lg:hidden fixed bottom-5 right-4 z-30'>
    {isOpen && (
      <>
        <div className='fixed inset-0 bg-black/20 -z-10' onClick={() => setIsOpen(false)} />
        <div className='absolute bottom-16 right-0 flex flex-col gap-3 mb-2'>
          {actions.map(({ label, icon: Icon, iconClass, onClick }) => (
            <button
              key={label}
              onClick={() => { onClick(); setIsOpen(false) }}
              className='flex items-center gap-3 bg-white text-gray-700 rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all group'
            >
              <div className={`${iconClass} rounded-full p-2`}>
                <Icon className='size-4' />
              </div>
              <span className='text-sm font-medium whitespace-nowrap'>{label}</span>
            </button>
          ))}
        </div>
      </>
    )}

    <button
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? 'Close actions menu' : 'Open actions menu'}
      aria-expanded={isOpen}
      className={`bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full p-3.5 shadow-xl hover:shadow-purple-500/50 transition-all ${isOpen ? 'rotate-180 scale-110' : ''}`}
    >
      <Sparkles className='size-5' />
    </button>
  </div>
)
