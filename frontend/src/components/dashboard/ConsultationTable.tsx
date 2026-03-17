import { useState } from 'react'
import type { Consultation } from '../../types'

interface Props {
  consultations: Consultation[]
  onStatusChange: (id: string, status: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  loading: boolean
}

const STATUS_OPTIONS = ['New', 'In Progress', 'Done']

const STATUS_STYLES: Record<string, string> = {
  New: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
  'In Progress': 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
  Done: 'bg-green-900/50 text-green-300 border-green-700/50',
}

export function ConsultationTable({ consultations, onStatusChange, onDelete, loading }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = consultations.filter((c) => {
    const matchesSearch =
      !search ||
      c.Name.toLowerCase().includes(search.toLowerCase()) ||
      c.Contact.includes(search) ||
      c.Details.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'All' || c.Status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    await onStatusChange(id, status)
    setUpdatingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete consultation ${id}? This cannot be undone.`)) return
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-400">Loading consultations...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Search by name, contact, details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">📭</div>
          <p>{search || statusFilter !== 'All' ? 'No results found' : 'No consultations yet'}</p>
          <p className="text-xs mt-1">Start a voice consultation to see data here</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Budget / Car</th>
                <th className="px-4 py-3 text-left">Details</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map((c) => (
                <tr
                  key={c.ID}
                  className="bg-slate-800/30 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{c.ID}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{c.Timestamp}</td>
                  <td className="px-4 py-3 text-white font-medium">{c.Name}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{c.Contact}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs border ${
                        c['Query Type'].includes('Buy')
                          ? 'bg-purple-900/40 text-purple-300 border-purple-700/40'
                          : 'bg-orange-900/40 text-orange-300 border-orange-700/40'
                      }`}
                    >
                      {c['Query Type'].includes('Buy') ? '🛒 Buy' : '💰 Sell'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs max-w-[120px] truncate" title={c.Budget !== '-' ? c.Budget : c['Car Preference']}>
                    {c.Budget !== '-' ? c.Budget : c['Car Preference']}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-[160px] truncate" title={c.Details}>
                    {c.Details}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={c.Status}
                      onChange={(e) => handleStatusChange(c.ID, e.target.value)}
                      disabled={updatingId === c.ID}
                      className={`text-xs px-2 py-1 rounded-lg border bg-transparent cursor-pointer focus:outline-none ${
                        STATUS_STYLES[c.Status] ?? 'bg-slate-700 text-slate-300 border-slate-600'
                      } disabled:opacity-50`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-slate-800 text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(c.ID)}
                      disabled={deletingId === c.ID}
                      className="text-red-500 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-900/20 transition-colors disabled:opacity-40"
                    >
                      {deletingId === c.ID ? '...' : '🗑️ Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-slate-500 text-xs mt-3 text-right">
        Showing {filtered.length} of {consultations.length} consultations
      </p>
    </div>
  )
}
