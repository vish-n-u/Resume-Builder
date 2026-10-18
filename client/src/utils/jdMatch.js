// Job match scoring: checks which job-description keywords appear in the resume text.
// Runs entirely in the browser so the score updates live while the user edits.

const REQUIRED_WEIGHT = 2
const PREFERRED_WEIGHT = 1

const htmlToText = (html) => (html || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Whole-term match that works for terms like "C++", "Node.js", ".NET" and "CI/CD".
// A term must not be glued to letters/digits on either side, so "Java" doesn't match "JavaScript"
// and "JS" doesn't match inside "Node.js".
const termRegex = (term) => new RegExp(`(?<![a-z0-9+#.])${escapeRegex(term.toLowerCase())}(?![a-z0-9+#])`, 'i')

const containsTerm = (text, keyword) =>
  [keyword.term, ...(keyword.aliases || [])].some(term => term && termRegex(term).test(text))

// Text of the parts of a resume (or profile) an ATS would read. Hidden sections are left out.
export const resumeText = (data, visibility = {}) => {
  if (!data) return ''
  const shown = (id) => visibility[id] !== false
  const parts = [data.personal_info?.profession]

  if (shown('summary')) parts.push(htmlToText(data.professional_summary))
  if (shown('skills')) parts.push(...(data.skills || []))
  if (shown('experience')) (data.experience || []).forEach(e => parts.push(e.position, e.company, htmlToText(e.description)))
  if (shown('projects')) (data.project || []).forEach(p => parts.push(p.name, p.type, htmlToText(p.description)))
  if (shown('education')) (data.education || []).forEach(e => parts.push(e.degree, e.field, e.institution))
  if (shown('certifications')) (data.certifications || []).forEach(c => parts.push(c.name, c.issuer))
  if (shown('achievements')) (data.achievements || []).forEach(a => parts.push(a.title, htmlToText(a.description)))
  if (shown('customSections')) (data.custom_sections || []).forEach(s => parts.push(s.section_name, htmlToText(s.content)))

  return parts.filter(Boolean).join(' \n ').toLowerCase()
}

// Returns the score (0-100) and keywords split into: on the resume, in the profile but not on
// the resume, and not found anywhere.
export const computeJobMatch = (keywords, resumeData, profileData) => {
  const onResume = resumeText(resumeData, resumeData?.sectionVisibility)
  const inProfile = resumeText(profileData)

  const matched = []
  const inProfileOnly = []
  const missing = []
  let earned = 0
  let total = 0

  for (const keyword of keywords || []) {
    const weight = keyword.importance === 'preferred' ? PREFERRED_WEIGHT : REQUIRED_WEIGHT
    total += weight
    if (containsTerm(onResume, keyword)) {
      matched.push(keyword)
      earned += weight
    } else if (inProfile && containsTerm(inProfile, keyword)) {
      inProfileOnly.push(keyword)
    } else {
      missing.push(keyword)
    }
  }

  return {
    score: total ? Math.round((earned / total) * 100) : 0,
    matched,
    inProfileOnly,
    missing,
  }
}
