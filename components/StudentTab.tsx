'use client'
import { useState } from 'react'
import { Settings, StudentConfig, CustomExpense } from '@/lib/types'
import { peso } from '@/lib/calc'
import { GraduationCap, Wallet, Utensils, Bus, BookOpen, Plus, Trash2, Calendar } from 'lucide-react'

interface Props {
  settings: Settings
}

export default function StudentTab({ settings }: Props) {
  const cfg = settings.studentConfig
  const [extraExpenses, setExtraExpenses] = useState<{name: string, amount: number}[]>([])
  
  const dailyBaseTotal = Object.values(cfg.baseDailyExpenses || {}).reduce((a, b) => a + b, 0)
  const dailyRemaining = cfg.dailyAllowance - dailyBaseTotal
  
  const weeklyAllowance = cfg.dailyAllowance * cfg.schoolDaysPerWeek
  const weeklyBaseTotal = dailyBaseTotal * cfg.schoolDaysPerWeek
  const weeklyExtraTotal = Object.values(cfg.weeklySchoolExtra || {}).reduce((a, b) => a + b, 0)
  const totalWeeklyExpenses = weeklyBaseTotal + weeklyExtraTotal
  const weeklySavings = weeklyAllowance - totalWeeklyExpenses

  const monthlySavings = weeklySavings * 4
  const savingsGoal = cfg.savingsGoal || 5000
  const savingsSplit = (cfg.savingsSplit || 70) / 100
  
  const weeklyActualSavings = weeklySavings * savingsSplit
  const weeklyActualBuffer = weeklySavings * (1 - savingsSplit)
  
  const monthlyActualSavings = monthlySavings * savingsSplit
  const progress = Math.min(100, (monthlyActualSavings / savingsGoal) * 100)

  return (
    <div className="space-y-6">
      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <GraduationCap size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Student Budget Tracker</h2>
              <p className="text-blue-100 text-sm">Managing your daily allowance efficiently</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-100 uppercase font-semibold tracking-wider mb-1">Savings Goal</div>
            <div className="text-xl font-bold">{peso(savingsGoal)}</div>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm mb-6">
          <div className="flex justify-between items-end mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-100">Monthly Progress</div>
            <div className="text-sm font-bold">{Math.round(progress)}%</div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-blue-100">
            <span>{peso(monthlyActualSavings)} saved</span>
            <span>{peso(savingsGoal)} target</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-blue-100 text-[10px] mb-1 uppercase font-semibold tracking-wider">Weekly Allowance</div>
            <div className="text-xl font-bold">{peso(weeklyAllowance)}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-blue-100 text-[10px] mb-1 uppercase font-semibold tracking-wider">Weekly Expenses</div>
            <div className="text-xl font-bold text-red-100">{peso(totalWeeklyExpenses)}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-blue-100 text-[10px] mb-1 uppercase font-semibold tracking-wider">Weekly Savings</div>
            <div className="text-xl font-bold text-emerald-300">{peso(weeklyActualSavings)}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-blue-100 text-[10px] mb-1 uppercase font-semibold tracking-wider">Weekly Buffer</div>
            <div className="text-xl font-bold text-amber-300">{peso(weeklyActualBuffer)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" />
              Daily Breakdown
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
              {cfg.schoolDaysPerWeek} days / week
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 bg-gray-50 rounded-xl px-3 mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Daily Allowance</span>
              <span className="text-sm font-bold text-gray-800">{peso(cfg.dailyAllowance)}</span>
            </div>
            
            <div className="space-y-1">
              {Object.entries(cfg.baseDailyExpenses || {}).map(([name, amount]) => (
                <div key={name} className="flex justify-between items-center py-1.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                      {name.toLowerCase().includes('food') || name.toLowerCase().includes('lunch') ? <Utensils size={12} /> : 
                       name.toLowerCase().includes('transpo') || name.toLowerCase().includes('fare') ? <Bus size={12} /> : 
                       <BookOpen size={12} />}
                    </div>
                    <span className="text-sm text-gray-600">{name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{peso(amount)}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-3 mt-3 border-t border-gray-100 px-3">
              <div className="flex justify-between items-center font-bold">
                <span className="text-sm text-gray-800">Total daily cost</span>
                <span className="text-red-500">{peso(dailyBaseTotal)}</span>
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-gray-500 italic">
                <span>Leftover per day:</span>
                <span className="text-emerald-600 font-medium">{peso(dailyRemaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly School Expenses */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-500" />
              Weekly Misc. & Extra
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              {Object.entries(cfg.weeklySchoolExtra || {}).map(([name, amount]) => (
                <div key={name} className="flex justify-between items-center py-1.5 px-3">
                  <span className="text-sm text-gray-600">{name}</span>
                  <span className="text-sm font-semibold text-gray-700">{peso(amount)}</span>
                </div>
              ))}
              
              {(cfg.customExpenses || []).length > 0 && (cfg.customExpenses || []).map(e => (
                <div key={e.id} className="flex justify-between items-center py-1.5 px-3">
                  <span className="text-sm text-gray-600 italic">{e.name}</span>
                  <span className="text-sm font-semibold text-violet-500">{peso(e.amount)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 px-3 space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Weekly Remaining (Potential)</span>
                <span className="font-medium text-gray-700">{peso(weeklySavings)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold border-t border-dashed border-gray-100 pt-2 mt-2">
                <div className="flex flex-col">
                  <span className="text-gray-800">Actual Weekly Savings</span>
                  <span className="text-[10px] text-gray-400 font-normal">({cfg.savingsSplit || 70}% of remaining)</span>
                </div>
                <span className="text-indigo-600 text-lg">{peso(weeklyActualSavings)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <div className="text-emerald-600 text-[10px] font-bold uppercase mb-1">Monthly Projected Savings</div>
          <div className="text-2xl font-black text-emerald-700">{peso(monthlyActualSavings)}</div>
          <p className="text-[10px] text-emerald-600/70 mt-1">Goal: {peso(savingsGoal)}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="text-amber-600 text-[10px] font-bold uppercase mb-1">Monthly Buffer Safety</div>
          <div className="text-2xl font-black text-amber-700">{peso(weeklyActualBuffer * 4)}</div>
          <p className="text-[10px] text-amber-600/70 mt-1">Extra cash for emergencies</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 col-span-2 md:col-span-1">
          <div className="text-indigo-600 text-[10px] font-bold uppercase mb-1">Savings Efficiency</div>
          <div className="text-2xl font-black text-indigo-700">{Math.round((weeklyActualSavings / weeklyAllowance) * 100)}%</div>
          <p className="text-[10px] text-indigo-600/70 mt-1">of weekly allowance saved</p>
        </div>
      </div>
      {/* Smart Savings Insights */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Smart Savings Insights</h3>
            <p className="text-xs text-gray-400 font-medium">How to reach your {peso(savingsGoal)} goal faster</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Timeline Insight */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              Current Timeline
            </div>
            {monthlyActualSavings > 0 ? (
              <p className="text-sm text-gray-600 leading-relaxed">
                At your current rate of <span className="font-bold text-indigo-600">{peso(monthlyActualSavings)}/month</span>, 
                it will take you <span className="font-bold text-gray-800">{Math.ceil(savingsGoal / monthlyActualSavings)} months</span> to reach your goal.
              </p>
            ) : (
              <p className="text-sm text-gray-600 italic">No active savings detected. Set a budget to see your timeline!</p>
            )}
          </div>

          {/* Quick Win 1: Expense Optimization */}
          {(() => {
            const sorted = Object.entries(cfg.baseDailyExpenses || {}).sort((a, b) => b[1] - a[1])
            if (sorted.length === 0) return null
            const [name, amount] = sorted[0]
            const dailySave = amount * 0.15 // 15% reduction
            const monthlyGain = dailySave * cfg.schoolDaysPerWeek * 4
            const newTotal = monthlyActualSavings + monthlyGain
            const newTimeline = Math.ceil(savingsGoal / newTotal)
            const timeSaved = Math.ceil(savingsGoal / monthlyActualSavings) - newTimeline

            return (
              <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
                <div className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
                  <Utensils size={16} className="text-indigo-500" />
                  Expense Optimization
                </div>
                <p className="text-sm text-indigo-900/70 leading-relaxed">
                  Saving <span className="font-bold text-indigo-700">{peso(dailySave)}</span> daily on <span className="font-bold text-indigo-700">{name}</span> (15% less) 
                  could add <span className="font-bold text-indigo-700">{peso(monthlyGain)}</span> to your monthly savings.
                </p>
                {timeSaved > 0 && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                    Reach goal {timeSaved} month{timeSaved > 1 ? 's' : ''} faster
                  </div>
                )}
              </div>
            )
          })()}

          {/* Quick Win 2: Buffer Strategy */}
          {weeklyActualBuffer > 50 && (
            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50">
              <div className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <Wallet size={16} className="text-emerald-500" />
                Buffer Strategy
              </div>
              <p className="text-sm text-emerald-900/70 leading-relaxed">
                If you move 50% of your current buffer (<span className="font-bold text-emerald-700">{peso(weeklyActualBuffer/2)}/week</span>) 
                to your savings, you'd reach your goal <span className="font-bold text-emerald-700">
                  {Math.ceil(savingsGoal / monthlyActualSavings) - Math.ceil(savingsGoal / (monthlyActualSavings + (weeklyActualBuffer * 0.5 * 4)))} months 
                </span> faster.
              </p>
            </div>
          )}

          {/* Efficiency Tip */}
          <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100/50">
            <div className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span className="text-amber-500">✨</span>
              Efficiency Tip
            </div>
            <p className="text-sm text-amber-900/70 leading-relaxed">
              Every <span className="font-bold text-amber-700">{peso(10)}</span> you save each day 
              turns into <span className="font-bold text-amber-700">{peso(10 * cfg.schoolDaysPerWeek * 4)}</span> by the end of the month!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
