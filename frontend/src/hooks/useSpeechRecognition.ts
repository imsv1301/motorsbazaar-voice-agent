import { useState, useCallback, useRef } from 'react'
import type { Language } from '../types'
import { getLanguageCode } from '../utils/voiceSelector'

// Local interface for Web Speech API (not universally typed in TS DOM lib)
interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((event: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface UseSpeechRecognitionOptions {
  language: Language
  onResult: (transcript: string) => void
  onError?: (error: string) => void
}

export function useSpeechRecognition({
  language,
  onResult,
  onError,
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition

    const recognition: SpeechRecognitionInstance = new SpeechRecognitionCtor()
    recognition.lang = getLanguageCode(language)
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim()
      if (transcript) onResult(transcript)
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      const msg =
        event.error === 'not-allowed'
          ? 'Microphone permission denied. Please allow microphone access in browser settings.'
          : event.error === 'no-speech'
          ? 'No speech detected. Please try again.'
          : `Recognition error: ${event.error}`
      onError?.(msg)
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, isListening, language, onResult, onError])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, startListening, stopListening, isSupported }
}
