'use client'
import { useState } from 'react'
import { Settings, MonthType, SpecialMonth, HistoryEntry, AdditionalPayment } from '@/lib/types'
import { calcCutoff15, calcCutoff30, CutoffResult, peso, getMonthsToGoal, buildHistoryEntry } from '@/lib/calc'
import { TrendingUp, PiggyBank, Wallet, Receipt, Plus, ChevronRight, Save } from 'lucide-react'

interface Props {
  settings: Settings
  onSaveHistory: (entry: HistoryEntry) => void
}

const MONTHS = [
  { value: 'january', label: 'January' }, { value: 'february', label: 'February' },
  { value: 'march', label: 'March' }, { value: 'april', label: 'April' },
  { value: 'may', label: 'May' }, { value: 'june', label: 'June' },
  { value: 'july', label: 'July' }, { value: 'august', label: 'August' },
  { value: 'september', label: 'September' }, { value: 'october', label: 'October' },
  { value: 'november', label: 'November' }, { value: 'december', label: 'December' },
]


function CutoffCard({ title, result, isHeavy }: { title: string; result: CutoffResult; isHeavy: boolean }) {
  const remColor = result.remaining < 0 ? 'text-red-500' : result.remaining < 500 ? 'text-amber-500' : 'text-emerald-500'

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isHeavy ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
          {isHeavy ? 'heavy' : 'light'}
        </span>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        Income: <span className="font-semibold text-gray-800 text-sm">{peso(result.income)}</span>
      </div>

      <div className="space-y-0">
        {result.expenses.map((e, i) => (
          <div key={i} className="flex justify-between items-center py-1.5 border-t border-gray-50 first:border-t-0">
            <span className="text-sm text-gray-600">{e.name}</span>
            <span className={`text-sm font-medium ${
              e.category === 'additional' ? 'text-rose-500' :
              e.category === 'custom' ? 'text-violet-500' :
              e.category === 'heavy' ? 'text-amber-600' : 'text-gray-700'
            }`}>
              {e.category === 'heavy' || e.category === 'custom' ? '~' : ''}{peso(e.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Total expenses</span>
          <span className="font-semibold text-red-500">{peso(result.totalExpenses)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Remaining</span>
          <span className={`font-semibold ${remColor}`}>{peso(result.remaining)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">→ Savings</span>
          <span className="font-semibold text-blue-600">{peso(result.savings)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">→ Buffer</span>
          <span className="font-semibold text-emerald-600">{peso(result.buffer)}</span>
        </div>
      </div>
    </div>
  )
}

function MultiSelectAdditional({ 
  payments, selected, onToggle 
}: { 
  payments: AdditionalPayment[], 
  selected: string[], 
  onToggle: (id: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-bold transition-all shadow-sm ${
          selected.length > 0 ? 'border-rose-200 bg-rose-50/30 text-rose-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className="truncate max-w-[150px] sm:max-w-[200px]">
          {selected.length === 0 ? 'Regular Months' : 
           selected.length === 1 ? payments.find(p => p.id === selected[0])?.month : 
           `${selected.length} payments active`}
        </span>
        <ChevronRight size={14} className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
            <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
              {payments.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 italic font-medium">Configure in Settings</div>
              ) : (
                payments.map(p => (
                  <label 
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group ${selected.includes(p.id) ? 'bg-rose-50/50' : ''}`}
                  >
                    <input 
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => onToggle(p.id)}
                      className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className={`text-sm font-bold transition-colors ${selected.includes(p.id) ? 'text-rose-600' : 'text-gray-700 group-hover:text-rose-500'}`}>{p.month}</div>
                      <div className="text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors">
                        {p.cutoff15 > 0 ? `${peso(p.cutoff15)}(15th)` : ''} 
                        {p.cutoff15 > 0 && p.cutoff30 > 0 ? ' • ' : ''}
                        {p.cutoff30 > 0 ? `${peso(p.cutoff30)}(30th)` : ''}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-gray-100 p-2 bg-gray-50/80">
                <button 
                  onClick={() => { selected.forEach(id => onToggle(id)); setIsOpen(false); }}
                  className="w-full py-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
                >
                  Deselect all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function Dashboard({ settings, onSaveHistory }: Props) {
  const [monthType, setMonthType] = useState<MonthType>('heavy')
  const [specialMonths, setSpecialMonths] = useState<SpecialMonth>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()].value)
  const [saved, setSaved] = useState(false)

  const r15 = calcCutoff15(settings, monthType, specialMonths)
  const r30 = calcCutoff30(settings, monthType, specialMonths)
  const totalSavings = r15.savings + r30.savings
  const totalExpenses = r15.totalExpenses + r30.totalExpenses
  const totalIncome = r15.income + r30.income
  const totalBuffer = (r15.remaining - r15.savings) + (r30.remaining - r30.savings)
  const monthsToGoal = getMonthsToGoal(settings.savingsGoal, totalSavings)
  const goalPct = settings.savingsGoal > 0 ? Math.min(100, Math.round((totalSavings * 3 / settings.savingsGoal) * 100)) : 0

  function handleSave() {
    const monthObj = MONTHS.find(m => m.value === selectedMonth)
    const label = `${monthObj?.label || selectedMonth} ${selectedYear}`
    const monthKey = `${selectedYear}-${selectedMonth}`
    const entry = buildHistoryEntry(settings, monthType, specialMonths, label, monthKey)
    onSaveHistory(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function toggleSpecialMonth(id: string) {
    setSpecialMonths(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Current month settings</h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Month type */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <button
                onClick={() => setMonthType('heavy')}
                className={`px-4 py-2 text-sm font-bold transition-all ${monthType === 'heavy' ? 'bg-amber-500 text-white shadow-inner' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Heavy Budget
              </button>
              <button
                onClick={() => setMonthType('light')}
                className={`px-4 py-2 text-sm font-bold transition-all ${monthType === 'light' ? 'bg-emerald-500 text-white shadow-inner' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Light Budget
              </button>
            </div>

            {/* Special months Multi-select Dropdown */}
            <MultiSelectAdditional 
              payments={settings.additionalPayments}
              selected={specialMonths}
              onToggle={toggleSpecialMonth}
            />
          </div>

          {/* Save to history */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-300"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-300"
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
            >
              <Save size={14} />
              {saved ? 'Saved!' : 'Save record'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Monthly income', value: peso(totalIncome), icon: Wallet, color: 'text-gray-700' },
          { label: 'Monthly expenses', value: peso(totalExpenses), icon: Receipt, color: 'text-red-500' },
          { label: 'Monthly savings', value: peso(totalSavings), icon: PiggyBank, color: 'text-blue-600' },
          { label: 'Monthly buffer', value: peso(totalBuffer), icon: TrendingUp, color: 'text-emerald-600' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <m.icon size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">{m.label}</span>
            </div>
            <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Cutoff breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CutoffCard title="15th cutoff" result={r15} isHeavy={monthType === 'heavy'} />
        <CutoffCard title="30th cutoff" result={r30} isHeavy={monthType === 'heavy'} />
      </div>

      {/* Expense legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-400 inline-block"></span>Base expense</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span>Heavy month only</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-400 inline-block"></span>Custom expense</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block"></span>Additional payment</span>
      </div>

      {/* Savings goal */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Savings goal progress</h3>
          <span className="text-sm text-gray-500">Goal: {peso(settings.savingsGoal)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{peso(totalSavings * 3)} projected in 3 months</span>
          <span>{goalPct}% of goal</span>
        </div>
        {r15.remaining < 0 && (
          <div className="mt-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
            ⚠ 15th cutoff is over budget by {peso(Math.abs(r15.remaining))}. Adjust your expenses in Settings.
          </div>
        )}
        {r15.remaining >= 0 && r15.remaining < 500 && (
          <div className="mt-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
            ⚠ 15th cutoff buffer is low ({peso(r15.remaining)} remaining). Consider trimming one expense.
          </div>
        )}
      </div>

      {/* Smart Savings Insights */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Worker Smart Insights</h3>
            <p className="text-xs text-gray-400 font-medium">Data-driven tips for your financial goal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Goal Insight */}
          <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50">
            <div className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              Goal Trajectory
            </div>
            <p className="text-sm text-blue-900/70 leading-relaxed">
              Based on your monthly savings of <span className="font-bold text-blue-700">{peso(totalSavings)}</span>, 
              you are on track to hit your <span className="font-bold text-gray-800">{peso(settings.savingsGoal)}</span> goal in about 
              <span className="font-bold text-blue-700"> {monthsToGoal} months</span>.
            </p>
          </div>

          {/* Expense Optimization */}
          {(() => {
            const allBase = [
              ...Object.entries(settings.cutoff15.baseExpenses),
              ...Object.entries(settings.cutoff30.baseExpenses)
            ].sort((a, b) => b[1] - a[1])
            
            if (allBase.length === 0) return null
            const [name, amount] = allBase[0]
            const potentialSave = amount * 0.1 // 10% reduction
            const newMonthlySavings = totalSavings + potentialSave
            const newTimeline = getMonthsToGoal(settings.savingsGoal, newMonthlySavings)
            const monthsSaved = (monthsToGoal || 0) - (newTimeline || 0)

            return (
              <div className="bg-violet-50/50 rounded-2xl p-5 border border-violet-100/50">
                <div className="text-sm font-bold text-violet-800 mb-3 flex items-center gap-2">
                  <Receipt size={16} className="text-violet-500" />
                  Expense Lean-down
                </div>
                <p className="text-sm text-violet-900/70 leading-relaxed">
                  Trimming <span className="font-bold text-violet-700">{name}</span> by just 10% (<span className="font-bold text-violet-700">{peso(potentialSave)}</span>) 
                  would speed up your goal by <span className="font-bold text-violet-700">{(monthsSaved && monthsSaved > 0) ? monthsSaved : 0} month{monthsSaved !== 1 ? 's' : ''}</span>.
                </p>
              </div>
            )
          })()}

          {/* Split Strategy */}
          <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50">
            <div className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <PiggyBank size={16} className="text-emerald-500" />
              Split Strategy
            </div>
            <p className="text-sm text-emerald-900/70 leading-relaxed">
              Your current <span className="font-bold text-emerald-700">{settings.savingsSplit}%</span> savings split is generating 
              <span className="font-bold text-emerald-700"> {peso(totalBuffer)}</span> in monthly buffer. 
              {settings.savingsSplit < 80 ? ' Increasing split to 80% could boost monthly savings by ' : ' Good job! Your buffer is currently '}
              <span className="font-bold text-emerald-700">{settings.savingsSplit < 80 ? peso(totalBuffer * 0.3) : 'well-optimized'}.</span>
            </p>
          </div>
        </div>
      </div>


      {/* 6-month projection table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-800 mb-4">6-month projection</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Month', 'Type', '15th savings', '30th savings', 'Monthly total', 'Cumulative'].map(h => (
                  <th key={h} className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[true, false, true, false, true, false].map((heavy, i) => {
                const pr15 = calcCutoff15(settings, heavy ? 'heavy' : 'light', [])
                const pr30 = calcCutoff30(settings, heavy ? 'heavy' : 'light', [])
                const ms = pr15.savings + pr30.savings
                const cum = [true, false, true, false, true, false]
                  .slice(0, i + 1)
                  .reduce((acc, h) => {
                    const c15 = calcCutoff15(settings, h ? 'heavy' : 'light', [])
                    const c30 = calcCutoff30(settings, h ? 'heavy' : 'light', [])
                    return acc + c15.savings + c30.savings
                  }, 0)
                return (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-700">Month {i + 1}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${heavy ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {heavy ? 'heavy' : 'light'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">{peso(pr15.savings)}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{peso(pr30.savings)}</td>
                    <td className="py-2.5 pr-4 font-semibold text-blue-600">{peso(ms)}</td>
                    <td className="py-2.5 font-bold text-emerald-600">{peso(cum)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
