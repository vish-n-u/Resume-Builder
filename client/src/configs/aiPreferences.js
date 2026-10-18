// AI writing preferences. Keys must match the enums in server/models/DetailedResume.js
// and the instructions in server/utils/aiPreferences.js.

export const WRITING_STYLES = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Clear, business-oriented language that leads with action verbs and outcomes',
    example: 'Led the migration of the billing service to Node.js, cutting average response time by 40%.',
  },
  {
    id: 'technical',
    label: 'Technical',
    description: 'Names the exact tools, frameworks and scale involved',
    example: 'Migrated the billing service from PHP to Node.js/Express with Redis caching, reducing p95 latency by 40%.',
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Distinctive, varied phrasing that still stays factual',
    example: 'Rebuilt the billing engine from the ground up in Node.js — customers now get answers 40% faster.',
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Plain, conversational wording with short sentences',
    example: 'Moved the billing service over to Node.js, which made it about 40% faster.',
  },
]

export const TONES = [
  { id: 'confident', label: 'Confident', description: 'Assertive, ownership-focused verbs like "Led", "Built", "Delivered"' },
  { id: 'friendly', label: 'Friendly', description: 'Warm; highlights collaboration and helping others' },
  { id: 'formal', label: 'Formal', description: 'Reserved and conservative; no casual expressions' },
  { id: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic; emphasizes initiative and impact' },
]
