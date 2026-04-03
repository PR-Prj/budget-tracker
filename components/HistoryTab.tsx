'use client'
import { useState } from 'react'
import { HistoryEntry } from '@/lib/types'
import { peso } from '@/lib/calc'
import { Trash2, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props {
  history: HistoryEntry[]
  onRemove: (id: string) => void
  onClear: () => void
  savingsGoal: number
}

function HistoryCard({ entry, onRemove }: { entry: HistoryEntry; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold text-gray-800">{entry.label}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${entry.monthType === 'heavy' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                {entry.monthType}
              </span>
              {entry.specialMonth.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
                  +{entry.specialMonth.length} extra
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-400">Savings</div>
            <div className="font-bold text-blue-600">{peso(entry.totalSavings)}</div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-400">Expenses</div>
            <div className="font-bold text-red-500">{peso(entry.totalExpenses)}</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: '15th cutoff', data: entry.cutoff15 },
              { title: '30th cutoff', data: entry.cutoff30 },
            ].map(({ title, data }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-700 text-sm">{title}</span>
                  <span className="text-xs text-gray-500">Income: {peso(data.income)}</span>
                </div>
                <div className="space-y-0">
                  {data.expenses.map((e, i) => (
                    <div key={i} className="flex justify-between py-1.5 text-sm border-t border-gray-50 first:border-t-0">
                      <span className="text-gray-600">{e.name}</span>
                      <span className={`font-medium ${
                        e.category === 'additional' ? 'text-rose-500' :
                        e.category === 'custom' ? 'text-violet-500' :
                        e.category === 'heavy' ? 'text-amber-600' : 'text-gray-700'
                      }`}>{peso(e.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total expenses</span>
                    <span className="font-semibold text-red-500">{peso(data.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Remaining</span>
                    <span className={`font-semibold ${data.remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{peso(data.remaining)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Savings</span>
                    <span className="font-semibold text-blue-600">{peso(data.savings)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Buffer</span>
                    <span className="font-semibold text-emerald-600">{peso(data.buffer)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HistoryTab({ history, onRemove, onClear, savingsGoal }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <TrendingUp size={48} className="text-gray-200 mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-1">No history yet</h3>
        <p className="text-sm text-gray-400">Go to Dashboard and click &quot;Save to history&quot; after each month.</p>
      </div>
    )
  }

  const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month))
  const cumData = sorted.reduce<{ label: string; savings: number; expenses: number; cumulative: number }[]>((acc, e) => {
    const prev = acc[acc.length - 1]?.cumulative || 0
    acc.push({ label: e.label, savings: e.totalSavings, expenses: e.totalExpenses, cumulative: prev + e.totalSavings })
    return acc
  }, [])

  const totalSaved = history.reduce((s, e) => s + e.totalSavings, 0)
  const totalSpent = history.reduce((s, e) => s + e.totalExpenses, 0)
  const avgSavings = Math.round(totalSaved / history.length)
  const goalPct = savingsGoal > 0 ? Math.min(100, Math.round((totalSaved / savingsGoal) * 100)) : 0

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Months tracked', value: history.length.toString(), color: 'text-gray-700' },
          { label: 'Total saved', value: peso(totalSaved), color: 'text-blue-600' },
          { label: 'Total spent', value: peso(totalSpent), color: 'text-red-500' },
          { label: 'Avg monthly savings', value: peso(avgSavings), color: 'text-emerald-600' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="text-xs text-gray-500 mb-1">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Goal progress */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-gray-700">Goal progress (actual)</span>
          <span className="text-sm text-gray-500">Goal: {peso(savingsGoal)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
          <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${goalPct}%` }} />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{peso(totalSaved)} saved so far</span>
          <span>{goalPct}%</span>
        </div>
      </div>

      {/* Chart */}
      {cumData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Savings over time</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => typeof v === 'number' ? peso(v) : v} />
                <Legend />
                <Line type="monotone" dataKey="cumulative" name="Cumulative savings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="savings" name="Monthly savings" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History list */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All entries ({history.length})</h3>
          <button
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} /> Clear all
          </button>
        </div>
        <div className="space-y-3">
          {[...history].sort((a, b) => b.month.localeCompare(a.month)).map(e => (
            <HistoryCard key={e.id} entry={e} onRemove={() => onRemove(e.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
