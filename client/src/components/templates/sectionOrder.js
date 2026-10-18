// Default order of reorderable resume sections (personal info / header is always first).
// Ids match the keys of resumeData.sectionVisibility.
export const DEFAULT_SECTION_ORDER = [
  'summary',
  'experience',
  'projects',
  'education',
  'skills',
  'certifications',
  'achievements',
  'customSections',
]

// Sorts a template's section ids by the user's chosen order. With no saved order the template's
// own order is kept, so each design still looks as intended by default.
// In two-column templates this is called once per column, so sections stay in their column.
export const orderSections = (sectionOrder, ids) => {
  if (!Array.isArray(sectionOrder) || sectionOrder.length === 0) return ids

  const rank = (id) => {
    const index = sectionOrder.indexOf(id)
    return index === -1 ? sectionOrder.length + DEFAULT_SECTION_ORDER.indexOf(id) : index
  }
  return [...ids].sort((a, b) => rank(a) - rank(b))
}
