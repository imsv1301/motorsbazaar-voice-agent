import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { Consultation } from '../types'
import { apiClient } from '../api/client'
import { StatsCards } from '../components/dashboard/StatsCards'
import { ConsultationTable } from '../components/dashboard/ConsultationTable'

export function DashboardPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getConsultations()
      // Newest first
      setConsultations([...res.consultations].reverse())
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiClient.updateStatus(id, status)
      setConsultations((prev) =>
        prev.map((c) => (c.ID === id ? { ...c, Status: status } : c)),
      )
    } catch (err) {
      alert('Failed to update status: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteConsultation(id)
      setConsultations((prev) => prev.filter((c) => c.ID !== id))
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚗</span>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">MotorsBazaar</h1>
              <p className="text-slate-400 text-xs">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs hidden sm:block">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              Refresh
            </button>
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg transition-colors"
            >
              + New Call
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error banner */}
        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-red-300 text-sm">❌ {error}</p>
            <button
              onClick={fetchData}
              className="text-red-400 hover:text-red-300 text-xs underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Google Sheets not configured warning */}
        {error?.includes('credentials') && (
          <div className="mb-4 bg-yellow-900/30 border border-yellow-700/40 rounded-xl px-4 py-4">
            <p className="text-yellow-300 text-sm font-semibold mb-1">
              ⚙️ Google Sheets not configured
            </p>
            <p className="text-yellow-400/70 text-xs">
              Follow the setup guide in README.md to connect Google Sheets. Until then, data won't be saved.
            </p>
          </div>
        )}

        {/* Stats */}
        <StatsCards consultations={consultations} />

        {/* Table section */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              📋 All Consultations
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                {consultations.length}
              </span>
            </h2>
            <a
              href="https://docs.google.com/spreadsheets"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-green-400 text-xs transition-colors"
            >
              📊 Open Google Sheet →
            </a>
          </div>

          <ConsultationTable
            consultations={consultations}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>

        {/* Footer */}
        <p className="text-slate-600 text-xs text-center mt-6">
          MotorsBazaar Voice Agent · Data synced with Google Sheets
        </p>
      </main>
    </div>
  )
}
