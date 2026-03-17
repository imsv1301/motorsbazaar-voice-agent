import { useState, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Language } from '../types'
import { useConversation } from '../hooks/useConversation'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { LanguageSelector } from '../components/voice/LanguageSelector'
import { VoiceOrb } from '../components/voice/VoiceOrb'
import { MicButton } from '../components/voice/MicButton'
import { checkGujaratiSupport } from '../utils/voiceSelector'

type OrbState = 'idle' | 'listening' | 'speaking' | 'thinking'

export function VoiceAgentPage() {
  const { messages, state, language, consultationData, error, selectLanguage, sendMessage, reset } =
    useConversation()

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis()
  const [orbState, setOrbState] = useState<OrbState>('idle')
  const [textInput, setTextInput] = useState('')
  const [langLoading, setLangLoading] = useState(false)
  const [noGujarati, setNoGujarati] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Keep orb state in sync
  useEffect(() => {
    if (isSpeaking) {
      setOrbState('speaking')
    } else if (state === 'chatting') {
      setOrbState('idle')
    } else if (state === 'complete') {
      setOrbState('idle')
    }
  }, [isSpeaking, state])

  const handleAgentReply = useCallback(
    (replyText: string, lang: Language) => {
      if (!replyText) return
      setOrbState('speaking')
      speak(replyText, lang, () => setOrbState('idle'))
    },
    [speak],
  )

  const handleUserInput = useCallback(
    async (text: string) => {
      if (!text.trim() || !language) return
      setOrbState('thinking')
      stopSpeaking()

      const reply = await sendMessage(text)
      if (reply) handleAgentReply(reply, language)
      else setOrbState('idle')
    },
    [language, sendMessage, handleAgentReply, stopSpeaking],
  )

  const { isListening, startListening, stopListening, isSupported: micSupported } =
    useSpeechRecognition({
      language: language ?? 'hindi',
      onResult: (transcript) => {
        stopListening()
        handleUserInput(transcript)
      },
      onError: (err) => {
        setOrbState('idle')
        console.error('Speech recognition error:', err)
      },
    })

  // Update orb when listening
  useEffect(() => {
    if (isListening) setOrbState('listening')
  }, [isListening])

  const handleLanguageSelect = async (lang: Language) => {
    if (lang === 'gujarati') {
      // Check voice support after voices load (slight delay)
      setTimeout(() => {
        if (!checkGujaratiSupport()) setNoGujarati(true)
      }, 1000)
    }

    setLangLoading(true)
    const greeting = await selectLanguage(lang)
    setLangLoading(false)

    if (greeting) {
      setOrbState('speaking')
      speak(greeting, lang, () => setOrbState('idle'))
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
      setOrbState('idle')
    } else {
      startListening()
    }
  }

  const handleTextSubmit = () => {
    const text = textInput.trim()
    if (!text) return
    setTextInput('')
    handleUserInput(text)
  }

  const handleNewConsultation = () => {
    stopSpeaking()
    reset()
    setOrbState('idle')
    setNoGujarati(false)
  }

  // ── Language Selection Screen ─────────────────────────────────
  if (state === 'language_select') {
    return <LanguageSelector onSelect={handleLanguageSelect} loading={langLoading} />
  }

  // ── Completed Screen ──────────────────────────────────────────
  if (state === 'complete' && consultationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800/80 border border-green-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-green-900/20">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-green-400 text-xl font-bold">
              {language === 'gujarati' ? 'Consultation સાચવાઈ!' : 'Consultation सेव हो गई!'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {language === 'gujarati'
                ? 'Google Sheet में record थयो'
                : 'Google Sheet में record हो गया'}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { label: 'Name / नाम', value: consultationData.name },
              { label: 'Contact / संपर्क', value: consultationData.contact },
              {
                label: 'Query Type',
                value: consultationData.query_type === 'buy' ? '🛒 Buy / खरीदना' : '💰 Sell / बेचना',
              },
              consultationData.budget
                ? { label: 'Budget', value: consultationData.budget }
                : null,
              consultationData.car_preference
                ? { label: 'Car Preference', value: consultationData.car_preference }
                : null,
            ]
              .filter(Boolean)
              .map((item) => (
                <div key={item!.label} className="flex justify-between items-start py-2 border-b border-slate-700">
                  <span className="text-slate-400 text-sm">{item!.label}</span>
                  <span className="text-white text-sm font-medium text-right max-w-[60%]">
                    {item!.value}
                  </span>
                </div>
              ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleNewConsultation}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-medium transition-colors"
            >
              New Consultation
            </button>
            <Link
              to="/dashboard"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 font-medium transition-colors text-center"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Chat Screen ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚗</span>
          <span className="text-white font-semibold">MotorsBazaar</span>
          <span className="text-slate-500 text-xs ml-1">
            {language === 'hindi' ? '· हिंदी' : '· ગુજરાતી'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
            Dashboard →
          </Link>
          <button onClick={handleNewConsultation} className="text-slate-500 hover:text-red-400 text-xs transition-colors">
            Reset
          </button>
        </div>
      </header>

      {/* Gujarati voice warning */}
      {noGujarati && (
        <div className="bg-yellow-900/30 border-b border-yellow-700/30 px-4 py-2 text-center">
          <p className="text-yellow-300 text-xs">
            ⚠️ Gujarati voice not available on this device. Using Hindi voice. Text will be in Gujarati.
          </p>
        </div>
      )}

      {/* Browser warning */}
      {!micSupported && (
        <div className="bg-red-900/30 border-b border-red-700/30 px-4 py-2 text-center">
          <p className="text-red-300 text-xs">
            ⚠️ Voice input requires Google Chrome or Microsoft Edge. You can still type your responses below.
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/30 border-b border-red-700/30 px-4 py-2 text-center">
          <p className="text-red-300 text-xs">❌ {error}</p>
        </div>
      )}

      {/* Voice Orb */}
      <div className="flex justify-center pt-6 pb-2">
        <VoiceOrb state={orbState} />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 max-w-2xl w-full mx-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                👩
              </div>
            )}
            <div
              className={`
                max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-slate-700/80 text-slate-100 rounded-bl-sm border border-slate-600/40'
                }
              `}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {orbState === 'thinking' && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0">
              👩
            </div>
            <div className="bg-slate-700/80 border border-slate-600/40 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Mic + text input */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <MicButton
            isListening={isListening}
            isSpeaking={isSpeaking}
            isThinking={orbState === 'thinking'}
            onClick={handleMicClick}
            textInput={textInput}
            onTextChange={setTextInput}
            onTextSubmit={handleTextSubmit}
          />
        </div>
      </div>
    </div>
  )
}
