import type { Consultation } from '../../types'

interface Props {
  consultations: Consultation[]
}

export function StatsCards({ consultations }: Props) {
  const total = consultations.length
  const newLeads = consultations.filter((c) => c.Status === 'New').length
  const buyCount = consultations.filter((c) =>
    c['Query Type'].toLowerCase().includes('buy'),
  ).length
  const sellCount = consultations.filter((c) =>
    c['Query Type'].toLowerCase().includes('sell'),
  ).length

  const cards = [
    {
      label: 'Total Consultations',
      value: total,
      icon: '📋',
      color: 'from-blue-600 to-blue-800',
      shadow: 'shadow-blue-900/30',
    },
    {
      label: 'New Leads',
      value: newLeads,
      icon: '🔔',
      color: 'from-green-600 to-green-800',
      shadow: 'shadow-green-900/30',
    },
    {
      label: 'Buy Queries',
      value: buyCount,
      icon: '🛒',
      color: 'from-purple-600 to-purple-800',
      shadow: 'shadow-purple-900/30',
    },
    {
      label: 'Sell Queries',
      value: sellCount,
      icon: '💰',
      color: 'from-orange-600 to-orange-800',
      shadow: 'shadow-orange-900/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.color} rounded-xl p-4 shadow-lg ${card.shadow}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.icon}</span>
            <span className="text-3xl font-bold text-white">{card.value}</span>
          </div>
          <p className="text-white/70 text-xs">{card.label}</p>
        </div>
      ))}
    </div>
  )
}
