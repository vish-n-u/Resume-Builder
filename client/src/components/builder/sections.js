import { Award, Briefcase, FileText, FolderIcon, GraduationCap, Plus, Sparkles, Trophy, User } from 'lucide-react'

// Builder sections in editing order. `title` is the heading shown above the form;
// the id doubles as the key in resumeData.sectionVisibility (personal info is always shown).
export const BUILDER_SECTIONS = [
  { id: "personal", name: "Personal Info", icon: User },
  { id: "summary", name: "Summary", title: "Professional Summary", icon: FileText },
  { id: "experience", name: "Experience", title: "Experience", icon: Briefcase },
  { id: "education", name: "Education", title: "Education", icon: GraduationCap },
  { id: "projects", name: "Projects", title: "Projects", icon: FolderIcon },
  { id: "skills", name: "Skills", title: "Skills", icon: Sparkles },
  { id: "certifications", name: "Certifications", title: "Certifications", icon: Award },
  { id: "achievements", name: "Achievements", title: "Achievements", icon: Trophy },
  { id: "customSections", name: "Custom Sections", title: "Custom Sections", icon: Plus },
]

export const DEFAULT_SECTION_VISIBILITY = {
  summary: true,
  experience: true,
  education: true,
  projects: true,
  skills: true,
  certifications: true,
  achievements: true,
  customSections: true,
}
