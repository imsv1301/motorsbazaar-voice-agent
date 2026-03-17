import type { Language } from '../types'

const LANG_CODES: Record<Language, string[]> = {
  hindi: ['hi-IN', 'hi'],
  gujarati: ['gu-IN', 'gu'],
}

/**
 * Pick the best available TTS voice for the given language.
 * Priority: Google voice > any female voice > any matching-lang voice
 * Falls back to Hindi voice if Gujarati not available.
 */
export function selectBestVoice(language: Language): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const codes = LANG_CODES[language]

  for (const code of codes) {
    const langPrefix = code.split('-')[0]

    // 1. Google voice (best quality on Chrome)
    const google = voices.find(
      (v) => v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes('google'),
    )
    if (google) return google

    // 2. Known high-quality female voices
    const knownFemale = voices.find(
      (v) =>
        v.lang.startsWith(langPrefix) &&
        (v.name.includes('Priya') ||
          v.name.includes('Lekha') ||
          v.name.includes('Heera') ||
          v.name.includes('Dhwani') ||
          v.name.includes('Swara')),
    )
    if (knownFemale) return knownFemale

    // 3. Any voice with "female" in name for this language
    const female = voices.find(
      (v) => v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes('female'),
    )
    if (female) return female

    // 4. Any voice for this language
    const any = voices.find((v) => v.lang.startsWith(langPrefix))
    if (any) return any
  }

  // Gujarati fallback → Hindi
  if (language === 'gujarati') {
    console.warn('[voiceSelector] Gujarati voice not found, falling back to Hindi voice')
    return selectBestVoice('hindi')
  }

  return null
}

export function getLanguageCode(language: Language): string {
  return LANG_CODES[language][0]
}

export function checkGujaratiSupport(): boolean {
  const voices = window.speechSynthesis.getVoices()
  return voices.some((v) => v.lang.startsWith('gu'))
}
