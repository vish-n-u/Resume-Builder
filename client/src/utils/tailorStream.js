import api from '../configs/api'

// Calls the streaming tailor endpoint and reports each progress stage as it arrives.
// Resolves with the new resumeId; rejects with an Error carrying the server's message.
// axios can't read a response body as it streams in the browser, so this uses fetch.
export const streamTailorResume = async ({ token, jobDescription, title, preferences, onProgress }) => {
  const baseURL = (api.defaults.baseURL || '').replace(/\/$/, '')

  const response = await fetch(`${baseURL}/api/ai/tailor-resume-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: JSON.stringify({ jobDescription, title, preferences }),
  })

  // Validation, auth and rate-limit errors come back as a normal JSON response
  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || 'Could not create the tailored resume')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      if (!line.trim()) continue
      const event = JSON.parse(line)
      if (event.type === 'progress') onProgress?.(event.stage)
      if (event.type === 'done') return event.resumeId
      if (event.type === 'error') throw new Error(event.message)
    }
  }

  throw new Error('Connection lost while creating your resume. Please try again.')
}
