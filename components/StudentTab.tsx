'use client'
import { Settings, StudentConfig, CustomExpense } from '@/lib/types'
import { peso } from '@/lib/calc'
import { GraduationCap, Wallet, Utensils, Bus, BookOpen, Calendar } from 'lucide-react'

interface Props {
  settings: Settings
}

export default function StudentTab({ settings }: Props) {
  const cfg = settings.studentConfig
  
  const dailyBaseTotal = Object.values(cfg.baseDailyExpenses || {}).reduce((a, b) => a + b, 0)
  const dailyRemaining = cfg.dailyAllowance - dailyBaseTotal
  
  const weeklyAllowance = cfg.dailyAllowance * cfg.schoolDaysPerWeek
  const weeklyBaseTotal = dailyBaseTotal * cfg.schoolDaysPerWeek
  const weeklyExtraTotal = Object.values(cfg.weeklySchoolExtra || {}).reduce((a, b) => a + b, 0)
  const totalWeeklyExpenses = weeklyBaseTotal + weeklyExtraTotal
  const weeklySavings = weeklyAllowance - totalWeeklyExpenses
  
  const savingsGoal = cfg.savingsGoal || 5000
  const savingsSplit = (cfg.savingsSplit || 70) / 100
  
  const weeklyActualSavings = weeklySavings * savingsSplit
  const weeklyActualBuffer = weeklySavings * (1 - savingsSplit)
  
  const monthlyActualSavings = weeklyActualSavings * 4
  const progress = Math.min(100, (monthlyActualSavings / savingsGoal) * 100)

  return (
    <div className="space-y-6">
      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
              <GraduationCap size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Student Hub</h2>
              <p className="text-blue-100 text-sm font-medium opacity-90">Daily allowance & savings tracker</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mb-1 opacity-80">Savings Goal</div>
            <div className="text-2xl font-bold">{peso(savingsGoal)}</div>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md mb-6 border border-white/10">
          <div className="flex justify-between items-end mb-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-50">Goal Progress</div>
            <div className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-lg">{Math.round(progress)}%</div>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2.5 text-[10px] text-blue-50 font-semibold uppercase tracking-tight">
            <span>{peso(monthlyActualSavings)} saved / mo</span>
            <span>{peso(savingsGoal)} target</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Weekly Allowance', val: weeklyAllowance, color: 'text-white' },
            { label: 'Weekly Expenses', val: totalWeeklyExpenses, color: 'text-red-200' },
            { label: 'Weekly Savings', val: weeklyActualSavings, color: 'text-emerald-300' },
            { label: 'Weekly Buffer', val: weeklyActualBuffer, color: 'text-amber-300' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 shadow-sm">
              <div className="text-blue-100 text-[9px] mb-1.5 uppercase font-bold tracking-widest opacity-80">{item.label}</div>
              <div className={`text-xl font-bold ${item.color}`}>{peso(item.val)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Distribution Summary */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Wallet size={20} className="text-blue-500" />
            Wallet Distribution <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">(Weekly Budget)</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(() => {
            const dist: Record<string, number> = {}
            Object.entries(cfg.baseDailyExpenses || {}).forEach(([name, amount]) => {
              const w = cfg.expenseWallets?.[name] || 'Other/Cash'
              dist[w] = (dist[w] || 0) + (amount * cfg.schoolDaysPerWeek)
            })
            Object.entries(cfg.weeklySchoolExtra || {}).forEach(([name, amount]) => {
              const w = cfg.expenseWallets?.[name] || 'Other/Cash'
              dist[w] = (dist[w] || 0) + amount
            })
            cfg.customExpenses?.forEach(e => {
              const w = e.wallet || 'Other/Cash'
              dist[w] = (dist[w] || 0) + e.amount
            })

            return Object.entries(dist).sort((a,b) => b[1] - a[1]).map(([wallet, amount]) => (
              <div key={wallet} className="flex flex-col p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-blue-200 transition-colors group">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 group-hover:text-blue-400">{wallet}</span>
                <span className="text-lg font-bold text-gray-900">{peso(amount)}</span>
              </div>
            ))
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Daily Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-500" />
              Daily Breakdown
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">
              {cfg.schoolDaysPerWeek} school days
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-2xl mb-4 border border-indigo-100/50">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Daily Allowance</span>
              <span className="text-lg font-bold text-indigo-900">{peso(cfg.dailyAllowance)}</span>
            </div>
            
            <div className="space-y-2">
              {Object.entries(cfg.baseDailyExpenses || {}).map(([name, amount]) => (
                <div key={name} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 shadow-sm">
                      {name.toLowerCase().includes('food') || name.toLowerCase().includes('lunch') ? <Utensils size={16} /> : 
                       name.toLowerCase().includes('transpo') || name.toLowerCase().includes('fare') ? <Bus size={16} /> : 
                       <BookOpen size={16} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-gray-800 truncate">{name}</span>
                      {cfg.expenseWallets?.[name] && <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">via {cfg.expenseWallets[name]}</span>}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 ml-4">{peso(amount)}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-6 mt-6 border-t border-gray-100 space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span className="text-sm text-gray-500 uppercase tracking-wider">Total Daily Cost</span>
                <span className="text-lg text-red-500">{peso(dailyBaseTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl border border-emerald-100/50">
                <span className="uppercase tracking-widest">Leftover for Savings</span>
                <span className="text-emerald-700 text-sm font-bold">{peso(dailyRemaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly School Expenses */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 className="font-black text-gray-800 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-500" />
              Weekly Misc. & Extra
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              {Object.entries(cfg.weeklySchoolExtra || {}).map(([name, amount]) => (
                <div key={name} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-gray-800 truncate">{name}</span>
                    {cfg.expenseWallets?.[name] && <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">via {cfg.expenseWallets[name]}</span>}
                  </div>
                  <span className="text-sm font-black text-gray-900 ml-4">{peso(amount)}</span>
                </div>
              ))}
              
              {(cfg.customExpenses || []).length > 0 && cfg.customExpenses?.map(e => (
                <div key={e.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-violet-50/30 transition-colors border border-transparent hover:border-violet-100/50 bg-violet-50/10">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-violet-900 truncate italic">{e.name}</span>
                    {e.wallet && <span className="text-[9px] font-black text-violet-400 uppercase tracking-tighter">via {e.wallet}</span>}
                  </div>
                  <span className="text-sm font-black text-violet-600 ml-4">{peso(e.amount)}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Potential Surplus</span>
                <span className="text-gray-600">{peso(weeklySavings)}</span>
              </div>
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 text-white flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Final Weekly Savings</span>
                  <span className="text-[9px] font-medium opacity-70">({cfg.savingsSplit || 70}% Allocation)</span>
                </div>
                <span className="text-2xl font-bold">{peso(weeklyActualSavings)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
