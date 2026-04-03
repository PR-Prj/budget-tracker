'use client'
import { useState } from 'react'
import { Settings, MonthType, SpecialMonth, HistoryEntry, AdditionalPayment } from '@/lib/types'
import { calcCutoff15, calcCutoff30, CutoffResult, peso, getMonthsToGoal, buildHistoryEntry } from '@/lib/calc'
import { TrendingUp, PiggyBank, Wallet, Receipt, Plus, ChevronRight, Save, Calendar } from 'lucide-react'

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
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${isHeavy ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
          {isHeavy ? 'heavy' : 'light'}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
        <span className="text-xs text-gray-500 font-medium">Income for this cutoff</span>
        <span className="font-bold text-gray-900 text-sm">{peso(result.income)}</span>
      </div>

      <div className="space-y-0.5">
        {result.expenses.map((e, i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-t border-gray-50 first:border-t-0 hover:bg-gray-50/30 transition-colors px-1 rounded-lg">
            <div className="flex flex-col min-w-0">
              <span className="text-sm text-gray-800 font-semibold truncate leading-tight">{e.name}</span>
              {e.wallet && (
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter leading-none mt-0.5">
                  via {e.wallet}
                </span>
              )}
            </div>
            <span className={`text-sm font-semibold ml-2 shrink-0 ${
              e.category === 'additional' ? 'text-rose-500' :
              e.category === 'custom' ? 'text-violet-500' :
              e.category === 'heavy' ? 'text-amber-600' : 'text-gray-700'
            }`}>
              {e.category === 'heavy' || e.category === 'custom' ? '~' : ''}{peso(e.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-500">Subtotal expenses</span>
          <span className="font-semibold text-red-500">{peso(result.totalExpenses)}</span>
        </div>
        <div className="flex justify-between text-sm pt-1.5 border-t border-dashed border-gray-200">
          <span className="text-gray-500">Remaining surplus</span>
          <span className={`font-semibold ${remColor}`}>{peso(result.remaining)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-blue-50/50 p-2 rounded-xl flex flex-col border border-blue-100/50">
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1 leading-none">Savings</span>
            <span className="text-sm font-bold text-blue-600 leading-tight">{peso(result.savings)}</span>
          </div>
          <div className="bg-emerald-50/50 p-2 rounded-xl flex flex-col border border-emerald-100/50">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1 leading-none">Buffer</span>
            <span className="text-sm font-bold text-emerald-600 leading-tight">{peso(result.buffer)}</span>
          </div>
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
        className={`flex items-center justify-between gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-semibold transition-all shadow-sm ${
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
                  className="w-full py-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
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
  const totalBuffer = r15.buffer + r30.buffer
  
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

  // Projection logic: strictly alternate starting from current dashboard MonthType
  const alternateType = monthType === 'heavy' ? 'light' : 'heavy'
  const projection = [0, 1, 2, 3, 4, 5].map(i => {
    const isCurrent = i === 0
    const mType = (i % 2 === 0) ? monthType : alternateType
    const sMonths = isCurrent ? specialMonths : []
    const pr15 = calcCutoff15(settings, mType, sMonths)
    const pr30 = calcCutoff30(settings, mType, sMonths)
    const ms = pr15.savings + pr30.savings
    return { 
      label: `Month ${i + 1}`, 
      type: mType, 
      s15: pr15.savings, 
      s30: pr30.savings, 
      monthly: ms,
      pSpecial: isCurrent && specialMonths.length > 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Monthly income', value: peso(totalIncome), icon: Wallet, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Monthly expenses', value: peso(totalExpenses), icon: Receipt, color: 'text-rose-500', bg: 'bg-rose-50/20' },
          { label: 'Monthly savings', value: peso(totalSavings), icon: PiggyBank, color: 'text-blue-600', bg: 'bg-blue-50/20' },
          { label: 'Monthly buffer', value: peso(totalBuffer), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50/20' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} border border-gray-200 rounded-2xl p-4 shadow-sm group hover:border-gray-300 transition-all`}>
            <div className="flex items-center gap-2 mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <m.icon size={14} className="text-gray-400" />
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{m.label}</span>
            </div>
            <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Current Month configuration</h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Month type */}
            <div className="flex p-1 bg-gray-50 border border-gray-100 rounded-xl shadow-inner shadow-gray-100">
              <button
                onClick={() => setMonthType('heavy')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${monthType === 'heavy' ? 'bg-white text-amber-600 shadow-sm border border-amber-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Heavy Budget
              </button>
              <button
                onClick={() => setMonthType('light')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${monthType === 'light' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Light Budget
              </button>
            </div>

            <MultiSelectAdditional 
              payments={settings.additionalPayments}
              selected={specialMonths}
              onToggle={toggleSpecialMonth}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-50 border border-gray-100 rounded-xl overflow-hidden p-1">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none border-none outline-none"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none border-none outline-none"
              >
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95 bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 disabled:bg-emerald-500 disabled:shadow-emerald-100 disabled:opacity-100 flex items-center gap-2"
              disabled={saved}
            >
              {saved ? <><PiggyBank size={14} /> Month Saved!</> : <><Save size={14} /> Save to history</>}
            </button>
          </div>
        </div>
      </div>

      {/* Cutoff columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <CutoffCard title="15th Cutoff" result={r15} isHeavy={monthType === 'heavy'} />
          
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">Wallet distribution (15th)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(r15.expenses.reduce((acc, e) => {
                const w = e.wallet || 'Other/Cash'
                acc[w] = (acc[w] || 0) + e.amount
                return acc
              }, {} as Record<string, number>)).sort((a,b) => b[1]-a[1]).map(([wallet, amount]) => (
                <div key={wallet} className="flex flex-col p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                  <span className="text-[9px] font-bold text-gray-400 uppercase mb-1">{wallet}</span>
                  <span className="text-sm font-bold text-gray-800">{peso(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <CutoffCard title="30th Cutoff" result={r30} isHeavy={monthType === 'heavy'} />
          
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4">Wallet distribution (30th)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(r30.expenses.reduce((acc, e) => {
                const w = e.wallet || 'Other/Cash'
                acc[w] = (acc[w] || 0) + e.amount
                return acc
              }, {} as Record<string, number>)).sort((a,b) => b[1]-a[1]).map(([wallet, amount]) => (
                <div key={wallet} className="flex flex-col p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-emerald-200 transition-colors">
                  <span className="text-[9px] font-bold text-gray-400 uppercase mb-1">{wallet}</span>
                  <span className="text-sm font-bold text-gray-800">{peso(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Analysis legend</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Base Monthly', color: 'bg-gray-400' },
            { label: 'Heavy Only', color: 'bg-amber-400' },
            { label: 'Custom Item', color: 'bg-violet-400' },
            { label: 'Special Payment', color: 'bg-rose-400' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-[4px] ${l.color} shadow-sm shrink-0`} />
              <span className="text-[11px] font-semibold text-gray-700">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Analysis Insights */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl shadow-inner shadow-blue-200/50">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Portfolio Strategy Insights</h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Reviewing your current 60/30/10 compliance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 60/30/10 Rule Tracker */}
          <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
            <div className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              60/30/10 Rule Check
            </div>
            <div className="space-y-4">
              {[
                { label: 'Expenses', actual: (totalExpenses / totalIncome) * 100, target: 60, color: 'bg-rose-400' },
                { label: 'Savings', actual: (totalSavings / totalIncome) * 100, target: 30, color: 'bg-blue-400' },
                { label: 'Buffer', actual: (totalBuffer / totalIncome) * 100, target: 10, color: 'bg-emerald-400' },
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-gray-500">{item.label}</span>
                    <span className={item.actual > item.target ? 'text-rose-500' : 'text-emerald-500'}>
                      {Math.round(item.actual)}% / {item.target}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.1)]`} 
                      style={{ width: `${Math.min(100, item.actual)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50">
            <div className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
              <PiggyBank size={16} className="text-blue-500" />
              Goal Trajectory
            </div>
            <p className="text-sm text-blue-900/60 leading-relaxed font-medium">
              Saving <span className="font-bold text-blue-700">{peso(totalSavings)}</span> monthly puts you at your <span className="font-bold text-gray-800">{peso(settings.savingsGoal)}</span> target in 
              <span className="font-bold text-blue-700"> {monthsToGoal} months</span>.
            </p>
          </div>

          <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50 flex flex-col justify-between">
            <div>
              <div className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <Wallet size={16} className="text-emerald-500" />
                Strategic Split
              </div>
              <p className="text-sm text-emerald-900/60 leading-relaxed font-medium">
                To reach exactly 30% savings with your current expenses, adjust your **Savings Split** to roughly 
                <span className="font-bold text-emerald-700"> {Math.round((0.3 * totalIncome / (totalIncome - totalExpenses)) * 100)}%</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden mb-10">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2">
             <Calendar size={20} className="text-indigo-500" />
             <h3 className="font-bold text-gray-800">Financial Growth Projection</h3>
           </div>
           <div className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">Accurate Estimate</div>
        </div>
        <div className="overflow-x-auto -mx-6 px-6 pb-2 scrollbar-hide">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-100">
                {['Month', 'Type', 'Status', '15th Savings', '30th Savings', 'Monthly Total', 'Cumulative'].map(h => (
                  <th key={h} className="text-left pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projection.map((month, i) => {
                const cum = projection
                  .slice(0, i + 1)
                  .reduce((acc, m) => acc + m.monthly, 0)
                
                return (
                  <tr key={i} className="border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 text-gray-800 font-semibold italic opacity-80">{month.label}</td>
                    <td className="py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-tighter ${month.type === 'heavy' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {month.type}
                      </span>
                    </td>
                    <td className="py-4">
                      {month.pSpecial ? (
                        <span className="text-[9px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full font-bold uppercase uppercase">Special Bonus</span>
                      ) : (
                        <span className="text-[9px] text-gray-300 font-medium">Standard</span>
                      )}
                    </td>
                    <td className="py-4 text-gray-500 font-medium">{peso(month.s15)}</td>
                    <td className="py-4 text-gray-500 font-medium">{peso(month.s30)}</td>
                    <td className="py-4 font-bold text-blue-600 text-sm">{peso(month.monthly)}</td>
                    <td className="py-4 font-bold text-emerald-600 text-base">{peso(cum)}</td>
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
