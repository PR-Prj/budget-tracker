'use client'
import { Settings, StudentConfig, CustomExpense } from '@/lib/types'
import { peso } from '@/lib/calc'
import { GraduationCap, Wallet, Utensils, Bus, BookOpen, Calendar, Coins, TrendingUp, PieChart, CreditCard, ChevronRight, PiggyBank } from 'lucide-react'

import BufferIndicator from './BufferIndicator'

interface Props {
  settings: Settings
}

export default function StudentTab({ settings }: Props) {
  const cfg = settings.studentConfig
  
  const dailyBaseTotal = Object.values(cfg?.baseDailyExpenses || {}).reduce((a, b) => a + b, 0)
  const dailyRemaining = (cfg?.dailyAllowance || 0) - dailyBaseTotal
  
  const weeklyAllowance = (cfg?.dailyAllowance || 0) * (cfg?.schoolDaysPerWeek || 0)
  const weeklyBaseTotal = dailyBaseTotal * (cfg?.schoolDaysPerWeek || 0)
  const weeklyExtraTotal = Object.values(cfg?.weeklySchoolExtra || {}).reduce((a, b) => a + b, 0)
  const totalWeeklyExpenses = weeklyBaseTotal + weeklyExtraTotal
  const weeklySavings = weeklyAllowance - totalWeeklyExpenses
  
  const savingsGoal = cfg.savingsGoal || 5000
  const savingsSplit = (cfg.savingsSplit || 70) / 100
  
  const weeklyActualSavings = weeklySavings * savingsSplit
  const weeklyActualBuffer = weeklySavings * (1 - savingsSplit)
  
  const monthlyActualSavings = weeklyActualSavings * 4
  const progress = Math.min(100, (monthlyActualSavings / savingsGoal) * 100)

  return (
    <div className="space-y-10 pb-20">
      {/* Student Profile Header */}
      <div className="bg-slate-900 rounded-[40px] p-8 sm:p-10 text-white shadow-2xl shadow-slate-200 border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-20 -mb-20 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/5 shadow-inner">
              <GraduationCap size={40} strokeWidth={1.5} className="text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Master's Dashboard</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight">Academic Funding</h2>
              <p className="text-slate-400 text-sm font-medium tracking-wide">Managing your scholastic budget and financial growth</p>
            </div>
          </div>
          
          <div className="flex-1 max-md w-full space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cumulative Progress</span>
              <div className="text-right">
                <div className="text-2xl font-black text-white">{Math.round(progress)}%</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{peso(monthlyActualSavings)} / month</div>
              </div>
            </div>
            <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Allowance', val: weeklyAllowance, color: 'text-slate-900', icon: CreditCard, bg: 'bg-white' },
          { label: 'Weekly Expenses', val: totalWeeklyExpenses, color: 'text-rose-600', icon: BookOpen, bg: 'bg-white' },
          { label: 'Net Savings', val: weeklyActualSavings, color: 'text-primary', icon: PiggyBank, bg: 'bg-white' },
          { label: 'Growth Buffer', val: weeklyActualBuffer, color: 'text-emerald-600', icon: TrendingUp, bg: 'bg-white' },
        ].map((item, idx) => (
          <div key={idx} className={`${item.bg} border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-primary/20 transition-soft group`}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-soft">
                <item.icon size={16} strokeWidth={1.5} className="text-slate-400 group-hover:text-primary transition-soft" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider leading-none">{item.label}</span>
            </div>
            <div className={`text-2xl font-black ${item.color} tracking-tight`}>{peso(item.val)}</div>
          </div>
        ))}
      </div>

      <BufferIndicator totalBuffer={weeklyActualBuffer} days={7} label="Weekly" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Daily Breakdown */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                 <Calendar size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Recurring Campus Costs</h3>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold uppercase tracking-[0.2em] border border-indigo-100/50">
              {cfg.schoolDaysPerWeek} school days
            </span>
          </div>
          
          <div className="space-y-8">
            <div className="flex justify-between items-center p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/30">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Base Daily Funds</span>
                <div className="text-2xl font-black text-slate-900">{peso(cfg.dailyAllowance)}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {Object.entries(cfg.baseDailyExpenses || {}).map(([name, amount]) => (
                <div key={name} className="flex justify-between items-center p-4 rounded-2xl group hover:bg-slate-50 transition-soft border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary transition-soft border border-slate-100 group-hover:border-primary/20">
                      {name.toLowerCase().includes('food') || name.toLowerCase().includes('lunch') ? <Utensils size={18} strokeWidth={1.5} /> : 
                       name.toLowerCase().includes('transpo') || name.toLowerCase().includes('fare') ? <Bus size={18} strokeWidth={1.5} /> : 
                       <BookOpen size={18} strokeWidth={1.5} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-soft truncate font-semibold uppercase tracking-wider">{name}</span>
                      {cfg.expenseWallets?.[name] && <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">via {cfg.expenseWallets[name]}</span>}
                    </div>
                  </div>
                  <span className="text-base font-black text-slate-900 ml-4 tracking-tighter">{peso(amount)}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-8 mt-4 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Daily Load</span>
                <span className="text-xl font-black text-rose-500">{peso(dailyBaseTotal)}</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-lg border border-emerald-100 text-emerald-500 shadow-sm">
                      <PiggyBank size={14} />
                   </div>
                   <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Leftover for Allocation</span>
                </div>
                <span className="text-xl font-black text-emerald-700">{peso(dailyRemaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly & Misc Expenses */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
            <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl border border-slate-100">
               <PieChart size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recurring Misc. & One-Time</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              {Object.entries(cfg.weeklySchoolExtra || {}).map(([name, amount]) => (
                <div key={name} className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-soft border border-transparent hover:border-slate-100">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-700 font-semibold uppercase tracking-wider truncate">{name}</span>
                    {cfg.expenseWallets?.[name] && <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">via {cfg.expenseWallets[name]}</span>}
                  </div>
                  <span className="text-base font-black text-slate-900 ml-4 tracking-tighter">{peso(amount)}</span>
                </div>
              ))}
              
              {(cfg.customExpenses || []).length > 0 && cfg.customExpenses?.map(e => (
                <div key={e.id} className="flex justify-between items-center p-4 rounded-2xl bg-indigo-50/[0.15] border border-indigo-100/30 hover:bg-indigo-50/30 transition-soft group">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-indigo-900/80 truncate italic group-hover:text-indigo-900 transition-soft">{e.name}</span>
                    {e.wallet && <span className="text-[9px] font-black text-indigo-400/60 uppercase tracking-tighter">via {e.wallet}</span>}
                  </div>
                  <span className="text-base font-black text-indigo-600 ml-4 tracking-tighter">{peso(e.amount)}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 mt-4 border-t border-slate-100 space-y-6">
              <div className="flex justify-between items-center px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <span>Weekly Operational Surplus</span>
                <span className="text-slate-600 font-black">{peso(weeklySavings)}</span>
              </div>
              <div className="p-8 bg-slate-900 rounded-[32px] text-white flex justify-between items-center shadow-2xl shadow-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Final Savings Pot</span>
                  <div className="text-sm font-medium text-slate-400 italic">Target: {cfg.savingsGoal || 5000}</div>
                </div>
                <div className="text-right">
                   <div className="text-3xl font-black">{peso(weeklyActualSavings)}</div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase">({cfg.savingsSplit || 70}% Yield)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Savings Jars */}
      {cfg.savingsJars && cfg.savingsJars.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                 <Coins size={20} className="text-primary" strokeWidth={1.5} />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Pot Distributions</h4>
            </div>
            <div className="text-[10px] bg-white text-slate-400 px-4 py-2 rounded-xl font-bold uppercase tracking-[0.2em] border border-slate-200">
              Monthly Allotment: {peso(monthlyActualSavings)}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cfg.savingsJars.map(jar => {
              const jarAmount = Math.round(monthlyActualSavings * (jar.splitPercent / 100))
              const jarProgress = jar.targetAmount > 0 ? Math.min(100, Math.round((jarAmount / jar.targetAmount) * 100)) : 0
              
              return (
                <div key={jar.id} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 flex flex-col gap-5 group hover:border-primary/20 hover:bg-white transition-soft">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest truncate pr-2 group-hover:text-slate-900 transition-soft">{jar.name}</span>
                    <span className="text-[9px] font-black bg-white border border-slate-200 text-primary px-2 py-1 rounded shadow-sm">{jar.splitPercent}%</span>
                  </div>
                  <div className="space-y-4">
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">{peso(jarAmount)}</div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-400 tracking-tighter">
                          <span>Target Progress</span>
                          <span className="text-primary">{jarProgress}%</span>
                       </div>
                       <div className="h-1 bg-slate-200 overflow-hidden rounded-full font-bold">
                          <div className="h-full bg-primary/40 rounded-full" style={{ width: `${jarProgress}%` }} />
                       </div>
                       <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">
                         of {peso(jar.targetAmount)} goal
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
