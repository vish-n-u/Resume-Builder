import React from 'react'
import { EyeOffIcon } from 'lucide-react'
import { BUILDER_SECTIONS } from './sections'

// Clickable list of builder sections, so users can jump straight to one instead of stepping with Prev/Next.
// Hidden sections are marked so it's clear they won't appear on the resume.
const SectionTabs = ({ activeIndex, onSelect, sectionVisibility, compact = false }) => (
  <nav aria-label='Resume sections' className='w-full overflow-x-auto -mx-1 px-1 pb-1'>
    <ul className='flex gap-1.5 w-max'>
      {BUILDER_SECTIONS.map((section, index) => {
        const Icon = section.icon
        const isActive = index === activeIndex
        const isHidden = section.id !== 'personal' && sectionVisibility?.[section.id] === false
        return (
          <li key={section.id}>
            <button
              onClick={() => onSelect(index)}
              aria-current={isActive ? 'step' : undefined}
              title={isHidden ? `${section.name} (hidden on resume)` : section.name}
              className={`flex items-center gap-1.5 rounded-full border whitespace-nowrap transition-colors ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} ${
                isActive
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              } ${isHidden && !isActive ? 'opacity-60' : ''}`}
            >
              <Icon className={compact ? 'size-3' : 'size-3.5'} />
              {section.name}
              {isHidden && <EyeOffIcon className='size-3' aria-label='hidden' />}
            </button>
          </li>
        )
      })}
    </ul>
  </nav>
)

export default SectionTabs
