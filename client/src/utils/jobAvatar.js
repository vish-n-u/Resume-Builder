const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-rose-500',
  'bg-emerald-600', 'bg-orange-500', 'bg-cyan-600',
]

export const avatarColor = (company = '') =>
  AVATAR_COLORS[company.charCodeAt(0) % AVATAR_COLORS.length]
