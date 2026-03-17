import { useState, useCallback } from 'react'
import type { Language, ConversationMessage, ExtractedConsultation, AgentState } from '../types'
import { apiClient } from '../api/client'

export interface UseConversationReturn {
  messages: ConversationMessage[]
  state: AgentState
  language: Language | null
  consultationData: ExtractedConsultation | null
  error: string | null
  selectLanguage: (lang: Language) => Promise<string>
  sendMessage: (text: string) => Promise<string>
  reset: () => void
}

export function useConversation(): UseConversationReturn {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [state, setState] = useState<AgentState>('language_select')
  const [language, setLanguage] = useState<Language | null>(null)
  const [consultationData, setConsultationData] = useState<ExtractedConsultation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [...prev, { role, content }])
  }, [])

  /** Called when user picks Hindi or Gujarati — fires the opening greeting */
  const selectLanguage = useCallback(
    async (lang: Language): Promise<string> => {
      setLanguage(lang)
      setState('chatting')
      setError(null)

      const greeting =
        lang === 'hindi'
          ? 'नमस्ते'
          : 'નમસ્તે'

      try {
        const res = await apiClient.chat({
          language: lang,
          conversation_history: [],
          user_message: greeting,
        })
        addMessage('assistant', res.reply)
        return res.reply
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to connect to agent'
        setError(msg)
        setState('error')
        return ''
      }
    },
    [addMessage],
  )

  /** Called every time the user speaks or types a message */
  const sendMessage = useCallback(
    async (text: string): Promise<string> => {
      if (!language || state !== 'chatting') return ''
      setError(null)

      addMessage('user', text)

      try {
        const res = await apiClient.chat({
          language,
          conversation_history: messages,
          user_message: text,
        })

        addMessage('assistant', res.reply)

        if (res.is_complete && res.extracted_data) {
          setConsultationData(res.extracted_data)
          setState('complete')
        }

        return res.reply
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong'
        setError(msg)
        return ''
      }
    },
    [language, state, messages, addMessage],
  )

  const reset = useCallback(() => {
    setMessages([])
    setState('language_select')
    setLanguage(null)
    setConsultationData(null)
    setError(null)
  }, [])

  return { messages, state, language, consultationData, error, selectLanguage, sendMessage, reset }
}
