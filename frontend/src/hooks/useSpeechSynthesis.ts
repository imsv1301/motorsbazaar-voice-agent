import { useState, useCallback, useEffect } from 'react'
import type { Language } from '../types'
import { selectBestVoice, getLanguageCode } from '../utils/voiceSelector'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!isSupported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [isSupported])

  const speak = useCallback(
    (text: string, language: Language, onEnd?: () => void) => {
      if (!isSupported) {
        onEnd?.()
        return
      }

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = getLanguageCode(language)
      utterance.rate = 0.88   // slightly slower — clearer for Indian languages
      utterance.pitch = 1.15  // slightly higher — young female feel
      utterance.volume = 1.0

      // Voice selection happens after voices load
      const voice = selectBestVoice(language)
      if (voice) utterance.voice = voice

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        onEnd?.()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        onEnd?.()
      }

      window.speechSynthesis.speak(utterance)
    },
    [isSupported, voices], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  return { speak, stop, isSpeaking, isSupported, voices }
}
