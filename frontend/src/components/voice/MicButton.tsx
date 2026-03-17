interface Props {
  isListening: boolean
  isSpeaking: boolean
  isThinking: boolean
  onClick: () => void
  textInput: string
  onTextChange: (v: string) => void
  onTextSubmit: () => void
}

export function MicButton({
  isListening,
  isSpeaking,
  isThinking,
  onClick,
  textInput,
  onTextChange,
  onTextSubmit,
}: Props) {
  const disabled = isSpeaking || isThinking

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      {/* Main mic button */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-2xl
          transition-all duration-200 shadow-xl
          ${isListening
            ? 'bg-red-500 hover:bg-red-400 scale-110 shadow-red-900/50'
            : disabled
            ? 'bg-slate-700 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 hover:scale-105 active:scale-95 shadow-blue-900/50'
          }
        `}
        title={isListening ? 'Click to stop' : 'Click to speak'}
      >
        {isListening ? '⏹️' : '🎤'}
      </button>

      <p className="text-slate-400 text-xs">
        {isListening
          ? 'Recording... click to stop'
          : disabled
          ? isSpeaking ? 'Priya is speaking...' : 'Please wait...'
          : 'Click mic to speak'}
      </p>

      {/* Text input fallback */}
      <div className="w-full">
        <p className="text-slate-500 text-xs text-center mb-2">
          या यहाँ type करें / અહિ type કરો
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !disabled && onTextSubmit()}
            disabled={disabled}
            placeholder="Type your response..."
            className="flex-1 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={onTextSubmit}
            disabled={disabled || !textInput.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
