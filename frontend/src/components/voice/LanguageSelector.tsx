import type { Language } from '../../types'

interface Props {
  onSelect: (lang: Language) => void
  loading: boolean
}

export function LanguageSelector({ onSelect, loading }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h1 className="text-3xl font-bold text-white tracking-wide">MotorsBazaar</h1>
        <p className="text-blue-300 mt-2 text-sm">Second Hand Car Consultation</p>
      </div>

      {/* Agent avatar */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-5xl shadow-xl shadow-purple-900/50">
          👩
        </div>
        <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-slate-900 animate-pulse" />
      </div>

      <h2 className="text-white text-xl font-semibold mb-1">नमस्ते! / નમસ્તે!</h2>
      <p className="text-blue-200 text-sm mb-8 text-center">
        मैं प्रिया हूँ — आपकी कार एक्सपर्ट
        <br />
        <span className="text-xs text-blue-400">
          Please choose your preferred language / अपनी भाषा चुनें
        </span>
      </p>

      {/* Language buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => onSelect('hindi')}
          disabled={loading}
          className="group relative flex flex-col items-center justify-center w-36 h-36 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold shadow-lg shadow-orange-900/50 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="text-4xl mb-2">🇮🇳</span>
          <span className="text-2xl">हिंदी</span>
          <span className="text-xs opacity-80 mt-1">Hindi</span>
        </button>

        <button
          onClick={() => onSelect('gujarati')}
          disabled={loading}
          className="group relative flex flex-col items-center justify-center w-36 h-36 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 hover:from-blue-400 hover:to-indigo-600 text-white font-bold shadow-lg shadow-indigo-900/50 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="text-4xl mb-2">🏡</span>
          <span className="text-2xl">ગુજરાતી</span>
          <span className="text-xs opacity-80 mt-1">Gujarati</span>
        </button>
      </div>

      {loading && (
        <div className="mt-8 flex items-center gap-2 text-blue-300">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Connecting to Priya...</span>
        </div>
      )}

      <p className="mt-8 text-slate-500 text-xs text-center">
        Use <strong>Google Chrome</strong> for best voice experience
      </p>
    </div>
  )
}
