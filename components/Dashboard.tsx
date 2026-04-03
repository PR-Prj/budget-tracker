'use client'
import { useState } from 'react'
import { Settings, MonthType, SpecialMonth, HistoryEntry, AdditionalPayment, SavingsJar } from '@/lib/types'
import { calcCutoff15, calcCutoff30, CutoffResult, peso, getMonthsToGoal, buildHistoryEntry, distributeSavingsToJars } from '@/lib/calc'
import { TrendingUp, PiggyBank, Wallet, Receipt, Plus, ChevronRight, Save, Calendar, Coins, PieChart, Info } from 'lucide-react'
import BufferIndicator from './BufferIndicator'
import BudgetChart from './BudgetChart'

interface Props {
  settings: Settings
  history: HistoryEntry[]
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


function CutoffCard({ 
  title, 
  result, 
  isHeavy, 
  actuals, 
  onActualChange,
  actualIncome,
  onIncomeChange,
  savingsSplit,
  jars
}: { 
  title: string; 
  result: CutoffResult; 
  isHeavy: boolean;
  actuals: Record<string, number>;
  onActualChange: (name: string, val: number) => void;
  actualIncome: number;
  onIncomeChange: (val: number) => void;
  savingsSplit: number;
  jars: SavingsJar[]
}) {
  const expenses = result?.expenses || []
  const totalActual = expenses.reduce((sum, e) => sum + (actuals[e.name] ?? e.amount), 0)
  const variance = result.totalExpenses - totalActual
  const effectiveIncome = actualIncome || result.income
  const remaining = effectiveIncome - totalActual
  
  const remColor = remaining < 0 ? 'text-rose-600' : remaining < 500 ? 'text-amber-600' : 'text-emerald-600'
  const varColor = variance < 0 ? 'text-rose-500' : variance > 0 ? 'text-emerald-500' : 'text-slate-400'

  const split = savingsSplit / 100
  const actualSavings = Math.max(0, Math.round(remaining * split))
  const actualBuffer = remaining - actualSavings

  const jarSplits = distributeSavingsToJars(actualSavings, jars)

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
        <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${
          isHeavy ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
          {isHeavy ? 'Heavy' : 'Light'}
        </span>
      </div>

      <div className="flex items-center justify-between mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Income Received</span>
          <span className="text-xs text-slate-400 font-medium pt-0.5">Budgeted: {peso(result.income)}</span>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Actual:</span>
           <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₱</span>
             <input
              type="number"
              value={actualIncome || result.income}
              onChange={(ev) => onIncomeChange(Number(ev.target.value))}
              className="w-32 pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-soft text-right shadow-sm"
            />
           </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center mb-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <span>Expense</span>
          <div className="flex gap-10">
            <span className="w-16 text-right">Planned</span>
            <span className="w-20 text-right">Actual</span>
          </div>
        </div>
        {result.expenses.map((e, i) => (
          <div key={i} className="flex justify-between items-center py-2.5 px-2 hover:bg-slate-50/50 transition-soft rounded-xl">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-slate-700 font-semibold truncate">{e.name}</span>
              {e.wallet && (
                <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider mt-0.5">
                  via {e.wallet}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <span className={`text-xs font-medium w-16 text-right ${
                e.category === 'additional' ? 'text-rose-500' :
                e.category === 'custom' ? 'text-violet-500' :
                e.category === 'heavy' ? 'text-amber-600' : 'text-slate-500'
              }`}>
                {peso(e.amount)}
              </span>
              <div className="relative">
                <input
                  type="number"
                  value={actuals[e.name] ?? e.amount}
                  onChange={(ev) => onActualChange(e.name, Number(ev.target.value))}
                  className="w-24 pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-soft text-right"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">₱</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-500">Planned Total</span>
          <span className="font-semibold text-slate-400">{peso(result.totalExpenses)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-500">Actual Total</span>
          <span className="font-bold text-slate-900">{peso(totalActual)}</span>
        </div>
        <div className="flex justify-between text-xs pt-1 border-t border-dashed border-slate-100">
          <span className="font-medium text-slate-400">Variance</span>
          <span className={`font-bold ${varColor}`}>
            {variance > 0 ? '+' : ''}{peso(variance)}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 mb-4">
          <span className="font-bold text-slate-700">Surplus</span>
          <span className={`font-black ${remColor}`}>{peso(remaining)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-primary/[0.03] p-4 rounded-2xl flex flex-col border border-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-4 -mt-4" />
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1.5 relative z-10">Savings</span>
            <span className="text-base font-black text-primary relative z-10">{peso(actualSavings)}</span>
            
            {jarSplits.length > 0 && (
              <div className="space-y-1.5 mt-3 pt-3 border-t border-primary/10 relative z-10">
                {jarSplits.map(js => (
                  <div key={js.jar.id} className="flex justify-between items-center text-[10px] text-primary/70 font-bold">
                    <span className="truncate pr-2">{js.jar.name}</span>
                    <span className="shrink-0">{peso(js.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-emerald-400/[0.03] p-4 rounded-2xl flex flex-col border border-emerald-400/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-400/5 rounded-full -mr-4 -mt-4" />
            <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-1.5 relative z-10">Buffer</span>
            <span className="text-base font-black text-emerald-600 relative z-10">{peso(actualBuffer)}</span>
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
        className={`flex items-center justify-between gap-3 px-4 py-2.5 bg-white border rounded-2xl text-sm font-semibold transition-soft shadow-sm ${
          selected.length > 0 ? 'border-rose-200 bg-rose-50/50 text-rose-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <span className="truncate max-w-[150px] sm:max-w-[200px] flex items-center gap-2">
          {selected.length === 0 ? (
            <><Calendar size={14} strokeWidth={2} /> Regular Month</>
          ) : (
            <><Calendar size={14} className="text-rose-500" strokeWidth={2} /> 
              {selected.length === 1 ? payments.find(p => p.id === selected[0])?.month : `${selected.length} Payments Active`}
            </>
          )}
        </span>
        <ChevronRight size={14} strokeWidth={2.5} className={`transform transition-soft text-slate-400 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-slate-200 rounded-[24px] shadow-2xl shadow-slate-300/50 z-50 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
            <div className="p-3 space-y-1 max-h-80 overflow-y-auto scrollbar-hide">
              {payments.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-400 italic text-center">Configure bonus months in Settings</div>
              ) : (
                payments.map(p => (
                  <label 
                    key={p.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-soft group ${selected.includes(p.id) ? 'bg-rose-50' : 'hover:bg-slate-50'}`}
                  >
                    <input 
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => onToggle(p.id)}
                      className="w-4 h-4 text-rose-500 rounded-md border-slate-300 focus:ring-rose-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${selected.includes(p.id) ? 'text-rose-600' : 'text-slate-700'}`}>{p.month}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {p.cutoff15 > 0 || p.cutoff30 > 0 ? (
                          <>
                            {p.cutoff15 > 0 && `15th`}
                            {p.cutoff15 > 0 && p.cutoff30 > 0 && ` & `}
                            {p.cutoff30 > 0 && `30th`}
                          </>
                        ) : 'No extra amount'}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-slate-100 p-2.5 bg-slate-50/50">
                <button 
                  onClick={() => { selected.forEach(id => onToggle(id)); setIsOpen(false); }}
                  className="w-full py-2 text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-soft uppercase tracking-widest"
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


export default function Dashboard({ settings, history, onSaveHistory }: Props) {
  const [monthType, setMonthType] = useState<MonthType>('heavy')
  const [specialMonths, setSpecialMonths] = useState<SpecialMonth>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()].value)
  const [actuals15, setActuals15] = useState<Record<string, number>>({})
  const [actuals30, setActuals30] = useState<Record<string, number>>({})
  const [actualIncome15, setActualIncome15] = useState<number>(0)
  const [actualIncome30, setActualIncome30] = useState<number>(0)
  const [saved, setSaved] = useState(false)

  const r15 = calcCutoff15(settings, monthType, specialMonths)
  const r30 = calcCutoff30(settings, monthType, specialMonths)
  
  const effectiveIncome15 = actualIncome15 || r15.income
  const effectiveIncome30 = actualIncome30 || r30.income
  
  const totalActualExpenses15 = r15.expenses.reduce((sum, e) => sum + (actuals15[e.name] ?? e.amount), 0)
  const totalActualExpenses30 = r30.expenses.reduce((sum, e) => sum + (actuals30[e.name] ?? e.amount), 0)
  
  const currentSavings15 = Math.max(0, Math.round((effectiveIncome15 - totalActualExpenses15) * (settings.savingsSplit / 100)))
  const currentSavings30 = Math.max(0, Math.round((effectiveIncome30 - totalActualExpenses30) * (settings.savingsSplit / 100)))
  
  const currentBuffer15 = (effectiveIncome15 - totalActualExpenses15) - currentSavings15
  const currentBuffer30 = (effectiveIncome30 - totalActualExpenses30) - currentSavings30

  const totalSavings = currentSavings15 + currentSavings30
  const totalExpenses = totalActualExpenses15 + totalActualExpenses30
  const totalIncome = effectiveIncome15 + effectiveIncome30
  const totalBuffer = currentBuffer15 + currentBuffer30
  
  const totalSavedSoFar = history.reduce((sum, entry) => sum + entry.totalSavings, 0)
  const savingsGoal = settings.savingsGoal || 1
  const overallGoalPct = Math.min(100, Math.round((totalSavedSoFar / savingsGoal) * 100))
  
  const activeMilestone = 
    overallGoalPct >= 100 ? 100 :
    overallGoalPct >= 75 ? 75 :
    overallGoalPct >= 50 ? 50 :
    overallGoalPct >= 25 ? 25 : 0

  const monthsToGoal = getMonthsToGoal(settings.savingsGoal, totalSavings)

  function handleSave() {
    const monthObj = MONTHS.find(m => m.value === selectedMonth)
    const label = `${monthObj?.label || selectedMonth} ${selectedYear}`
    const monthKey = `${selectedYear}-${selectedMonth}`
    const entry = buildHistoryEntry(
      settings, 
      monthType, 
      specialMonths, 
      label, 
      monthKey, 
      actuals15, 
      actuals30,
      actualIncome15 || undefined,
      actualIncome30 || undefined
    )
    onSaveHistory(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function toggleSpecialMonth(id: string) {
    setSpecialMonths(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Projection logic... (rest remains the same)
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
    <div className="space-y-8 pb-12">
      {/* Running Savings Balance & Milestone Tracker */}
      <div className="bg-slate-900 rounded-[40px] p-8 sm:p-10 text-white shadow-2xl shadow-slate-200 border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-20 -mb-20 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/5">
                <PiggyBank size={20} strokeWidth={1.5} className="text-primary" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Total Savings Pot</span>
            </div>
            <div className="flex items-baseline gap-4">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white">{peso(totalSavedSoFar)}</h1>
              <span className="text-xl font-bold text-slate-500">/ {peso(savingsGoal)}</span>
            </div>
            <p className="text-slate-400 text-xs font-medium tracking-wide pt-2">Accumulated financial growth across all recorded months</p>
          </div>

          <div className="flex-1 max-w-lg w-full space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Goal Progress</span>
                <div className="text-2xl font-black text-white">{overallGoalPct}%</div>
              </div>
              <div className="text-right">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Status</span>
                 <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                   overallGoalPct >= 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                 }`}>
                   {overallGoalPct >= 100 ? 'Goal Achieved 🚀' : 'On Track'}
                 </span>
              </div>
            </div>
            
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${overallGoalPct}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between gap-4">
              {[25, 50, 75, 100].map(m => (
                <div key={m} className="flex-1 space-y-2">
                  <div className={`h-1 rounded-full transition-all duration-700 ${
                    overallGoalPct >= m ? 'bg-primary' : 'bg-slate-800'
                  }`} />
                  <span className={`text-[9px] font-bold uppercase tracking-tighter block text-center ${
                    overallGoalPct >= m ? 'text-slate-300' : 'text-slate-600'
                  }`}>{m}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BufferIndicator totalBuffer={totalBuffer} days={30} label="Monthly" />

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: peso(totalIncome), icon: Wallet, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Total Expenses', value: peso(totalExpenses), icon: Receipt, color: 'text-rose-600', bg: 'bg-white' },
          { label: 'Net Savings', value: peso(totalSavings), icon: PiggyBank, color: 'text-primary', bg: 'bg-white' },
          { label: 'Safety Buffer', value: peso(totalBuffer), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-white' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-primary/30 transition-soft group`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-soft">
                <m.icon size={16} strokeWidth={1.5} className="text-slate-400 group-hover:text-primary transition-soft" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider leading-none">{m.label}</span>
            </div>
            <div className={`text-xl font-black ${m.color} tracking-tight`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Month type toggle */}
            <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <button
                onClick={() => setMonthType('heavy')}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-soft ${
                  monthType === 'heavy' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Heavy Budget
              </button>
              <button
                onClick={() => setMonthType('light')}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-soft ${
                  monthType === 'light' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden p-1.5">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-transparent px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none border-none outline-none appearance-none cursor-pointer"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <div className="w-px h-4 bg-slate-200 self-center mx-1" />
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-transparent px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none border-none outline-none appearance-none cursor-pointer"
              >
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button
              onClick={handleSave}
              className={`px-6 py-3 text-xs font-bold rounded-2xl transition-soft flex items-center gap-2.5 shadow-lg active:scale-95 ${
                saved 
                  ? 'bg-emerald-500 text-white shadow-emerald-200 cursor-default' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
              }`}
              disabled={saved}
            >
              {saved ? (
                <><PieChart size={16} strokeWidth={2} /> Saved to History</>
              ) : (
                <><Save size={16} strokeWidth={2} /> Save Monthly Snapshot</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cutoff columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <CutoffCard 
            title="Mid-Month Cycle (15th)" 
            result={r15} 
            isHeavy={monthType === 'heavy'} 
            actuals={actuals15}
            onActualChange={(name, val) => setActuals15(prev => ({ ...prev, [name]: val }))}
            actualIncome={actualIncome15}
            onIncomeChange={(val) => setActualIncome15(val)}
            savingsSplit={settings.savingsSplit}
            jars={settings.savingsJars}
          />
          
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm shadow-slate-200/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 block">Wallet Allocation (15th)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries((r15.expenses || []).reduce((acc, e) => {
                const w = e.wallet || 'Other/Cash'
                acc[w] = (acc[w] || 0) + e.amount
                return acc
              }, {} as Record<string, number>)).sort((a,b) => b[1]-a[1]).map(([wallet, amount]) => (
                <div key={wallet} className="flex flex-col p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-primary/20 hover:bg-white transition-soft group">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-soft">{wallet}</span>
                  <span className="text-base font-black text-slate-800">{peso(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CutoffCard 
            title="End-Month Cycle (30th)" 
            result={r30} 
            isHeavy={monthType === 'heavy'} 
            actuals={actuals30}
            onActualChange={(name, val) => setActuals30(prev => ({ ...prev, [name]: val }))}
            actualIncome={actualIncome30}
            onIncomeChange={(val) => setActualIncome30(val)}
            savingsSplit={settings.savingsSplit}
            jars={settings.savingsJars}
          />
          
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm shadow-slate-200/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 block">Wallet Allocation (30th)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries((r30.expenses || []).reduce((acc, e) => {
                const w = e.wallet || 'Other/Cash'
                acc[w] = (acc[w] || 0) + e.amount
                return acc
              }, {} as Record<string, number>)).sort((a,b) => b[1]-a[1]).map(([wallet, amount]) => (
                <div key={wallet} className="flex flex-col p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-primary/20 hover:bg-white transition-soft group">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-soft">{wallet}</span>
                  <span className="text-base font-black text-slate-800">{peso(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BudgetChart 
        expenses={[...r15.expenses, ...r30.expenses]} 
        savings={totalSavings} 
        buffer={totalBuffer}
      />

      {/* Projection table */}
      <div className="bg-white border border-slate-200 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-sm shadow-slate-200/50 mb-12">
        <div className="flex items-center justify-between mb-10">
           <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Projection</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">6-Month Financial Estimation</p>
           </div>
           <div className="hidden sm:block px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             Based on Current Savings Split
           </div>
        </div>

        <div className="space-y-1">
          {projection.map((month, i) => {
             const cum = projection
                  .slice(0, i + 1)
                  .reduce((acc, m) => acc + m.monthly, 0)
             
             return (
               <div key={i} className="group">
                 {/* Desktop View: Sleek Horizontal List */}
                 <div className="hidden sm:flex items-center justify-between p-5 hover:bg-slate-50 transition-soft rounded-2xl text-slate-600 border-b border-slate-50 last:border-0">
                   <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-soft">
                       M{i + 1}
                     </div>
                     <div className="flex flex-col">
                       <span className="text-base font-bold text-slate-800 tracking-tight group-hover:text-primary transition-soft">{month.label}</span>
                       <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${
                            month.type === 'heavy' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {month.type}
                          </span>
                          {month.pSpecial && (
                            <>
                              <span className="text-[9px] text-slate-300">•</span>
                              <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-rose-500" />
                                Bonus Active
                              </span>
                            </>
                          )}
                       </div>
                     </div>
                   </div>

                   <div className="flex items-center gap-16 text-right">
                      <div className="hidden md:flex flex-col">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Breakdown</span>
                         <span className="text-xs font-medium text-slate-500">{peso(month.s15)} + {peso(month.s30)}</span>
                      </div>
                      <div className="flex flex-col w-24">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Flow</span>
                         <span className="text-sm font-bold text-slate-800">{peso(month.monthly)}</span>
                      </div>
                      <div className="flex flex-col min-w-[140px]">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Balance</span>
                         <span className="text-xl font-black text-primary tracking-tight">{peso(cum)}</span>
                      </div>
                   </div>
                 </div>

                 {/* Mobile View: Sleek Vertical Card */}
                 <div className="sm:hidden bg-slate-50/50 border border-slate-100 rounded-3xl p-6 mb-4 space-y-5 hover:bg-white hover:border-primary/20 transition-soft group-hover:shadow-lg group-hover:shadow-slate-200/50">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-black text-primary">M{i+1}</div>
                          <span className="text-sm font-bold text-slate-800">{month.label}</span>
                       </div>
                       {month.pSpecial && (
                          <span className="text-[8px] text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1 border border-rose-100 bg-rose-50 px-2 py-0.5 rounded-full animate-pulse-slow">
                            Bonus
                          </span>
                       )}
                    </div>

                    <div className="space-y-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Accumulated Balance</span>
                       <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-primary tracking-tighter">{peso(cum)}</span>
                          <span className={`text-[10px] font-bold uppercase ${month.type === 'heavy' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {month.type} cycle
                          </span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 py-4 border-y border-dashed border-slate-200">
                       <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">15th Savings</span>
                          <span className="text-sm font-bold text-slate-700">{peso(month.s15)}</span>
                       </div>
                       <div className="space-y-0.5 text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">30th Savings</span>
                          <span className="text-sm font-bold text-slate-700">{peso(month.s30)}</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Net Monthly Flow</span>
                       <span className="text-base font-black text-slate-900">{peso(month.monthly)}</span>
                    </div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  )
}

