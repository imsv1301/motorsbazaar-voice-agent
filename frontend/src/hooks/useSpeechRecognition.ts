import { useState, useCallback, useRef } from 'react'
import type { Language } from '../types'
import { getLanguageCode } from '../utils/voiceSelector'

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
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return

    const SpeechRecognition =
      window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition

    const recognition = new SpeechRecognition()
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
