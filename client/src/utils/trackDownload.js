import api from '../configs/api'

// Records that a resume was downloaded (the Save as PDF window was opened):
// once in PostHog, and once on our own server so the admin panel can show it
// even for visitors whose ad blocker hides PostHog.
// The same resume opened twice within a few seconds (e.g. button click + the
// browser's own "beforeprint" signal) is only counted once.
let lastTracked = { id: null, at: 0 }

export const trackResumeDownload = ({ resumeId, token, posthog, source, template }) => {
  const now = Date.now()
  if (lastTracked.id === (resumeId || 'none') && now - lastTracked.at < 5000) return
  lastTracked = { id: resumeId || 'none', at: now }

  posthog?.capture('resume_downloaded', { resumeId, template, source })
  if (resumeId && token) {
    api.post('/api/resumes/downloaded/' + resumeId, {}, { headers: { Authorization: token } }).catch(() => {})
  }
}
