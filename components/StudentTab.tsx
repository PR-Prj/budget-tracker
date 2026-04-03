'use client'
import { useState } from 'react'
import { Settings, HistoryEntry, SavingsJar, CustomExpense } from '@/lib/types'
import { peso, buildStudentHistoryEntry } from '@/lib/calc'
import { 
  GraduationCap, 
  Wallet, 
  Utensils, 
  Bus, 
  BookOpen, 
  Calendar, 
  Coins, 
  TrendingUp, 
  PieChart, 
  CreditCard, 
  ChevronRight, 
  PiggyBank, 
  Save, 
  Info, 
  Plus,
  ArrowRight
} from 'lucide-react'

const MONTHS = [
  { value: 'january', label: 'January' }, { value: 'february', label: 'February' },
  { value: 'march', label: 'March' }, { value: 'april', label: 'April' },
  { value: 'may', label: 'May' }, { value: 'june', label: 'June' },
  { value: 'july', label: 'July' }, { value: 'august', label: 'August' },
  { value: 'september', label: 'September' }, { value: 'october', label: 'October' },
  { value: 'november', label: 'November' }, { value: 'december', label: 'December' },
]

import BufferIndicator from './BufferIndicator'
import BudgetChart from './BudgetChart'

interface Props {
  settings: Settings
  history: HistoryEntry[]
  onSaveHistory: (entry: HistoryEntry) => void
}

export default function StudentTab({ settings, history, onSaveHistory }: Props) {
  const cfg = settings.studentConfig
  
  // State for Actuals
  const [actualDailyAllowance, setActualDailyAllowance] = useState<number>(cfg.dailyAllowance)
  const [actualDailyExpenses, setActualDailyExpenses] = useState<Record<string, number>>({})
  const [actualWeeklyExtras, setActualWeeklyExtras] = useState<Record<string, number>>({})
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()].value)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [saved, setSaved] = useState(false)

  // Calcs
  const dailyBaseTarget = Object.values(cfg?.baseDailyExpenses || {}).reduce((a, b) => a + b, 0)
  const totalActualDaily = Object.entries(cfg.baseDailyExpenses || {}).reduce((sum, [name, amount]) => {
    return sum + (actualDailyExpenses[name] ?? amount)
  }, 0)

  const dailyRemaining = actualDailyAllowance - totalActualDaily
  
  const weeklyAllowance = actualDailyAllowance * (cfg?.schoolDaysPerWeek || 0)
  const weeklyBaseTotalActual = totalActualDaily * (cfg?.schoolDaysPerWeek || 0)
  
  const totalActualWeeklyExtras = Object.entries(cfg.weeklySchoolExtra || {}).reduce((sum, [name, amount]) => {
    return sum + (actualWeeklyExtras[name] ?? amount)
  }, 0)
  
  const totalWeeklyExpenses = weeklyBaseTotalActual + totalActualWeeklyExtras
  const weeklySurplus = weeklyAllowance - totalWeeklyExpenses

  const savingsSplit = (cfg.savingsSplit || 70) / 100
  const actualWeeklySavings = Math.max(0, Math.round(weeklySurplus * savingsSplit))
  const actualWeeklyBuffer = weeklySurplus - actualWeeklySavings
  
  const monthlySavingsEst = actualWeeklySavings * 4
  const totalSavedSoFar = history.reduce((sum, entry) => sum + entry.totalSavings, 0) // Simplified for now
  const savingsGoal = cfg.savingsGoal || 5000
  const progress = Math.min(100, (totalSavedSoFar / savingsGoal) * 100)

  // 6-Week Projection
  const projection = [0, 1, 2, 3, 4, 5].map(i => {
    const cum = (i + 1) * actualWeeklySavings
    return {
      label: `Week ${i + 1}`,
      weekly: actualWeeklySavings,
      cumulative: cum
    }
  })

  function handleSave() {
    const monthObj = MONTHS.find(m => m.value === selectedMonth)
    const label = `Week ${selectedWeek}, ${monthObj?.label} ${selectedYear}`
    const key = `${selectedYear}-${selectedMonth}-W${selectedWeek}`
    
    const entry = buildStudentHistoryEntry(
      settings,
      label,
      key,
      actualDailyAllowance,
      actualDailyExpenses,
      actualWeeklyExtras
    )
    
    onSaveHistory(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Student Hero: Savings & Progress */}
      <div className="bg-slate-900 rounded-[40px] p-8 sm:p-10 text-white shadow-2xl shadow-slate-200 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-20 -mb-20 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/5 shadow-inner">
                <GraduationCap size={32} strokeWidth={1.5} className="text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Student Dashboard</span>
                <h2 className="text-3xl font-black tracking-tight leading-none text-white">Academic Funding</h2>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                 <h1 className="text-5xl font-black tracking-tight">{peso(totalSavedSoFar)}</h1>
                 <span className="text-lg font-bold text-slate-500">/ {peso(savingsGoal)}</span>
              </div>
              <p className="text-slate-400 text-xs font-medium tracking-wide">Total scholarship & allowance savings accumulated</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-lg w-full space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Goal Progress</span>
                <div className="text-2xl font-black text-white">{Math.round(progress)}%</div>
              </div>
              <div className="text-right">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Status</span>
                 <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                   progress >= 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                 }`}>
                   {progress >= 100 ? 'Goal Achieved 🎓' : 'Growing'}
                 </span>
              </div>
            </div>
            
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between gap-4">
              {[25, 50, 75, 100].map(m => (
                <div key={m} className="flex-1 space-y-2">
                  <div className={`h-1.5 rounded-full transition-all duration-700 ${
                    progress >= m ? 'bg-primary' : 'bg-slate-800'
                  }`} />
                  <span className={`text-[9px] font-bold uppercase tracking-tighter block text-center ${
                    progress >= m ? 'text-slate-300' : 'text-slate-600'
                  }`}>{m}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BufferIndicator totalBuffer={actualWeeklyBuffer} days={7} label="Weekly" />

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Income', value: peso(weeklyAllowance), icon: CreditCard, color: 'text-slate-900', desc: `${cfg.schoolDaysPerWeek} school days` },
          { label: 'Weekly Expenses', value: peso(totalWeeklyExpenses), icon: BookOpen, color: 'text-rose-600', desc: 'Actual total' },
          { label: 'Weekly Savings', value: peso(actualWeeklySavings), icon: PiggyBank, color: 'text-primary', desc: `${cfg.savingsSplit}% yield` },
          { label: 'Safety Buffer', value: peso(actualWeeklyBuffer), icon: TrendingUp, color: 'text-emerald-600', desc: 'Freedom pot' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-primary/30 transition-soft group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50/50 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-soft">
                <m.icon size={16} strokeWidth={1.5} className="text-slate-400 group-hover:text-primary transition-soft" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider leading-none">{m.label}</span>
            </div>
            <div className={`text-xl font-black ${m.color} tracking-tight`}>{m.value}</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Daily Ledger Controls */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-primary" /> Daily Ledger
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Track today's campus spending</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden p-1.5">
               <select
                value={selectedWeek}
                onChange={e => setSelectedWeek(Number(e.target.value))}
                className="bg-transparent px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none border-none outline-none appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5].map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
              <div className="w-px h-4 bg-slate-200 self-center" />
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-transparent px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none border-none outline-none appearance-none cursor-pointer"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <div className="w-px h-4 bg-slate-200 self-center" />
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-transparent px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none border-none outline-none appearance-none cursor-pointer"
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="flex bg-slate-50 border border-slate-100 rounded-2xl p-1.5 items-center gap-3">
              <div className="flex flex-col pl-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Planned: {peso(cfg.dailyAllowance)}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Allowance</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₱</span>
                <input 
                  type="number"
                  value={actualDailyAllowance}
                  onChange={(e) => setActualDailyAllowance(Number(e.target.value))}
                  className="w-24 pl-6 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-soft text-right shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              className={`px-6 py-3 text-xs font-bold rounded-2xl transition-soft flex items-center gap-2.5 shadow-lg active:scale-95 ${
                saved 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
              }`}
            >
              {saved ? <><Save size={16} /> Snapshot Saved</> : <><Save size={16} /> Save Weekly Report</>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Expenses Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
            <h4 className="text-base font-black text-slate-900 uppercase tracking-wider">Recurring Campus Costs</h4>
            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black border border-indigo-100 uppercase tracking-widest">
              Daily Target: {peso(dailyBaseTarget)}
            </div>
          </div>

          <div className="space-y-1">
             <div className="flex justify-between items-center mb-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <span>Expense Item</span>
                <div className="flex gap-10">
                   <span className="w-16 text-right">Budget</span>
                   <span className="w-20 text-right">Actual</span>
                </div>
             </div>
             {Object.entries(cfg.baseDailyExpenses || {}).map(([name, amount]) => (
                <div key={name} className="flex justify-between items-center py-3 px-3 hover:bg-slate-50/70 transition-soft rounded-2xl border border-transparent hover:border-slate-100 group">
                   <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white transition-soft border border-slate-100">
                        {name.toLowerCase().includes('food') ? <Utensils size={18} /> : 
                         name.toLowerCase().includes('transpo') ? <Bus size={18} /> : 
                         <BookOpen size={18} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                         <span className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900">{name}</span>
                         {cfg.expenseWallets?.[name] && <span className="text-[9px] font-black text-primary/70 uppercase tracking-tighter">via {cfg.expenseWallets[name]}</span>}
                      </div>
                   </div>
                   <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs font-medium text-slate-500 w-16 text-right">{peso(amount)}</span>
                      <div className="relative">
                         <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">₱</span>
                         <input 
                            type="number"
                            value={actualDailyExpenses[name] ?? amount}
                            onChange={(e) => setActualDailyExpenses(prev => ({ ...prev, [name]: Number(e.target.value) }))}
                            className="w-24 pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-soft text-right"
                         />
                      </div>
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
             <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Spent Today</span>
                <span className="text-xl font-black text-rose-500">{peso(totalActualDaily)}</span>
             </div>
             <div className="flex justify-between items-center p-5 bg-emerald-50 rounded-3xl border border-emerald-100/50">
                <div className="space-y-0.5">
                   <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Remaining Funds</div>
                   <div className="text-[9px] font-medium text-emerald-600/70">From today's allowance</div>
                </div>
                <span className={`text-2xl font-black ${dailyRemaining < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                   {peso(dailyRemaining)}
                </span>
             </div>
          </div>
        </div>

        {/* Weekly & Misc Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm shadow-slate-200/50">
           <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
             <h4 className="text-base font-black text-slate-900 uppercase tracking-wider">Weekly Extras & Misc</h4>
             <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black border border-slate-100 uppercase tracking-widest">
               Non-Daily Items
             </span>
           </div>

           <div className="space-y-4">
              <div className="space-y-1">
                 {Object.entries(cfg.weeklySchoolExtra || {}).map(([name, amount]) => (
                    <div key={name} className="flex justify-between items-center py-3 px-3 hover:bg-slate-50/70 transition-soft rounded-2xl border border-transparent hover:border-slate-100 group">
                       <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900 uppercase tracking-wider">{name}</span>
                          {cfg.expenseWallets?.[name] && <span className="text-[9px] font-black text-slate-400 uppercase">via {cfg.expenseWallets[name]}</span>}
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="text-xs font-medium text-slate-500 w-16 text-right">{peso(amount)}</span>
                          <div className="relative">
                             <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">₱</span>
                             <input 
                                type="number"
                                value={actualWeeklyExtras[name] ?? amount}
                                onChange={(e) => setActualWeeklyExtras(prev => ({ ...prev, [name]: Number(e.target.value) }))}
                                className="w-24 pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-soft text-right"
                             />
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {(cfg.customExpenses || []).map(e => (
                    <div key={e.id} className="flex justify-between items-center py-3 px-3 italic bg-indigo-50/20 rounded-2xl border border-indigo-100/30 group mb-1">
                       <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-bold text-indigo-900/80 truncate group-hover:text-indigo-900 transition-soft">{e.name}</span>
                          {e.wallet && <span className="text-[9px] font-black text-indigo-400/60 uppercase">via {e.wallet}</span>}
                       </div>
                       <span className="text-sm font-black text-indigo-600">{peso(e.amount)}</span>
                    </div>
                 ))}
                 
                 {(!cfg.weeklySchoolExtra || Object.keys(cfg.weeklySchoolExtra).length === 0) && (cfg.customExpenses?.length === 0) && (
                    <div className="py-12 text-center">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No weekly extras configured</p>
                    </div>
                 )}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                 <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Net Weekly Surplus</span>
                    <span className="text-xl font-black text-slate-900">{peso(weeklySurplus)}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/[0.03] p-5 rounded-[24px] border border-primary/10 relative overflow-hidden group hover:bg-primary/[0.05] transition-soft">
                       <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-4 -mt-4" />
                       <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest block mb-2">Weekly Savings</span>
                       <span className="text-2xl font-black text-primary leading-none">{peso(actualWeeklySavings)}</span>
                    </div>
                    <div className="bg-emerald-500/[0.03] p-5 rounded-[24px] border border-emerald-500/10 relative overflow-hidden group hover:bg-emerald-500/[0.05] transition-soft">
                       <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full -mr-4 -mt-4" />
                       <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest block mb-2">Weekly Buffer</span>
                       <span className="text-2xl font-black text-emerald-600 leading-none">{peso(actualWeeklyBuffer)}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <BudgetChart 
        expenses={[
          ...Object.entries(cfg.baseDailyExpenses || {}).map(([name, amount]) => ({ name, amount: (actualDailyExpenses[name] ?? amount) * cfg.schoolDaysPerWeek, category: 'base' })),
          ...Object.entries(cfg.weeklySchoolExtra || {}).map(([name, amount]) => ({ name, amount: actualWeeklyExtras[name] ?? amount, category: 'extra' })),
          ...(cfg.customExpenses || []).map(e => ({ name: e.name, amount: e.amount, category: 'custom' }))
        ]} 
        savings={actualWeeklySavings} 
        buffer={actualWeeklyBuffer}
      />



      {/* Savings Jars Distributions */}
      {cfg.savingsJars && cfg.savingsJars.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                 <Coins size={20} className="text-primary" strokeWidth={1.5} />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Active Savings Pots</h4>
            </div>
            <div className="text-[10px] bg-white text-slate-400 px-4 py-2 rounded-xl font-bold uppercase tracking-[0.2em] border border-slate-200">
              Allocating: {peso(actualWeeklySavings)} / week
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cfg.savingsJars.map(jar => {
              const jarWeekly = Math.round(actualWeeklySavings * (jar.splitPercent / 100))
              const jarProgress = jar.targetAmount > 0 ? Math.min(100, Math.round((jarWeekly * 4 / jar.targetAmount) * 100)) : 0
              
              return (
                <div key={jar.id} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 flex flex-col gap-5 group hover:border-primary/20 hover:bg-white transition-soft">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest truncate pr-2 group-hover:text-slate-900 transition-soft">{jar.name}</span>
                    <span className="text-[9px] font-black bg-white border border-slate-200 text-primary px-2 py-1 rounded shadow-sm">{jar.splitPercent}%</span>
                  </div>
                  <div className="space-y-4">
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">{peso(jarWeekly)}<span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">/ wk</span></div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-400 tracking-tighter">
                          <span>Est. Monthly Progress</span>
                          <span className="text-primary">{jarProgress}%</span>
                       </div>
                       <div className="h-1 bg-slate-200 overflow-hidden rounded-full font-bold">
                          <div className="h-full bg-primary/40 rounded-full" style={{ width: `${jarProgress}%` }} />
                       </div>
                       <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">
                         Target: {peso(jar.targetAmount)}
                       </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
