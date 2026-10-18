import DOMPurify from 'dompurify'

// Resume content is rich text from Quill and the AI, and public resumes are viewable by anyone,
// so strip scripts, event handlers and other unsafe markup before rendering it as HTML.
export const sanitizeHtml = (html) => {
  if (typeof html !== 'string' || !html) return html || ''
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
}

const cleanList = (items, field) =>
  Array.isArray(items) ? items.map(item => (item ? { ...item, [field]: sanitizeHtml(item[field]) } : item)) : items

// Returns a copy of the resume data with every rich-text field sanitized
export const sanitizeResumeData = (data) => {
  if (!data) return data
  return {
    ...data,
    professional_summary: sanitizeHtml(data.professional_summary),
    experience: cleanList(data.experience, 'description'),
    project: cleanList(data.project, 'description'),
    achievements: cleanList(data.achievements, 'description'),
    custom_sections: cleanList(data.custom_sections, 'content'),
  }
}
