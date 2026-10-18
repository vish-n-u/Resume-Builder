// Turns the user's AI preferences into concrete writing instructions for prompts.
// Keep the keys in sync with the enums in models/DetailedResume.js and the client's AI Preferences tab.

const STYLE_GUIDES = {
    professional: 'Clear, business-oriented language. Lead each bullet with a strong action verb, state the outcome, and avoid slang, buzzwords and filler.',
    technical: 'Precise technical language. Name the specific languages, frameworks, tools, architectures and scale involved; prefer concrete implementation detail over general claims.',
    creative: 'Vivid, distinctive phrasing with varied sentence openings and memorable word choices, while staying factual and easy to scan.',
    casual: 'Plain, conversational wording with short sentences and everyday words, still suitable for a resume (no first person, no slang).',
}

const TONE_GUIDES = {
    confident: 'Assertive and ownership-focused ("Led", "Built", "Delivered"). No hedging words like "helped with" or "assisted in" unless that is accurate.',
    friendly: 'Warm and approachable; highlight collaboration, mentoring and helping users or teammates where the data supports it.',
    formal: 'Reserved and conservative; no exclamation marks, contractions or casual expressions.',
    enthusiastic: 'Energetic and motivated; emphasize impact, initiative and passion for the work, without exaggerating facts.',
}

export const WRITING_STYLES = Object.keys(STYLE_GUIDES)
export const TONES = Object.keys(TONE_GUIDES)

// Saved preferences, optionally overridden for a single request (e.g. from the tailor modal)
export const resolvePreferences = (saved = {}, override = {}) => ({
    writing_style: WRITING_STYLES.includes(override?.writing_style) ? override.writing_style : (saved.writing_style || 'professional'),
    tone: TONES.includes(override?.tone) ? override.tone : (saved.tone || 'confident'),
    custom_requirements: saved.custom_requirements || '',
})

export const buildPreferencesBlock = (preferences = {}) => {
    const style = STYLE_GUIDES[preferences.writing_style] ? preferences.writing_style : 'professional'
    const tone = TONE_GUIDES[preferences.tone] ? preferences.tone : 'confident'

    return `USER PREFERENCES (Follow these when writing content):
- Writing Style (${style}): ${STYLE_GUIDES[style]}
- Tone (${tone}): ${TONE_GUIDES[tone]}
${preferences.custom_requirements ? `\nIMPORTANT - CUSTOM REQUIREMENTS FROM USER:\n${preferences.custom_requirements}\n` : ''}`
}
