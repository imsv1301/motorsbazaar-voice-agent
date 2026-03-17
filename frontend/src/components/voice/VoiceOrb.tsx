interface Props {
  state: 'idle' | 'listening' | 'speaking' | 'thinking'
}

const STATE_CONFIG = {
  idle: {
    outer: 'bg-purple-900/30',
    inner: 'bg-gradient-to-br from-pink-400 to-purple-600',
    ring: '',
    label: 'प्रिया / Priya',
    emoji: '👩',
  },
  listening: {
    outer: 'bg-green-900/30 animate-pulse-slow',
    inner: 'bg-gradient-to-br from-green-400 to-emerald-600',
    ring: 'ring-4 ring-green-400/60 ring-offset-4 ring-offset-slate-900 animate-ping-slow',
    label: 'Listening... / सुन रही हूँ',
    emoji: '👂',
  },
  speaking: {
    outer: 'bg-blue-900/30',
    inner: 'bg-gradient-to-br from-blue-400 to-cyan-600',
    ring: 'ring-4 ring-blue-400/60 ring-offset-4 ring-offset-slate-900',
    label: 'Speaking... / बोल रही हूँ',
    emoji: '🗣️',
  },
  thinking: {
    outer: 'bg-yellow-900/30',
    inner: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    ring: '',
    label: 'Thinking... / सोच रही हूँ',
    emoji: '💭',
  },
}

export function VoiceOrb({ state }: Props) {
  const config = STATE_CONFIG[state]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${config.outer}`}>
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-2xl transition-all duration-500 ${config.inner} ${config.ring}`}
        >
          {config.emoji}
        </div>
      </div>

      {/* Sound wave bars for speaking state */}
      {state === 'speaking' && (
        <div className="flex items-end gap-0.5 h-8">
          {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-blue-400 rounded-full"
              style={{
                height: `${h * 6}px`,
                animation: `wave 1.2s ease-in-out ${i * 0.12}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Listening dots */}
      {state === 'listening' && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}

      {/* Thinking spinner */}
      {state === 'thinking' && (
        <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      )}

      <p className="text-slate-300 text-xs">{config.label}</p>
    </div>
  )
}
