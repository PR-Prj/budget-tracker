'use client'
import { useState } from 'react'
import { HistoryEntry } from '@/lib/types'
import { peso } from '@/lib/calc'
import { exportToCSV } from '@/lib/export'
import { Trash2, ChevronDown, ChevronUp, TrendingUp, Download, Printer, Calendar, PieChart, Wallet, CreditCard, ChevronRight, PiggyBank, Receipt } from 'lucide-react'
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
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden print:border-none print:shadow-none break-inside-avoid mb-6 shadow-sm shadow-slate-200/50 hover:border-primary/20 transition-soft group">
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 transition-soft print:p-0 print:mb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/20 transition-soft">
             <Calendar size={20} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-black text-slate-900 tracking-tight flex items-center gap-2">
              {entry.label}
              {entry.mode === 'student' && (
                <span className="text-[8px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-widest font-bold">
                  Student Weekly
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {entry.mode !== 'student' ? (
                <>
                  <span className={`text-[9px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest border ${
                    entry.monthType === 'heavy' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {entry.monthType}
                  </span>
                  {entry.specialMonth && entry.specialMonth.length > 0 && (
                    <span className="text-[9px] px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 font-bold uppercase tracking-widest">
                      +{entry.specialMonth.length} High-Yield
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[9px] px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold uppercase tracking-widest">
                  {entry.studentData?.schoolDaysPerWeek} Campus Days
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Savings</div>
            <div className="text-lg font-black text-primary leading-none tracking-tighter">{peso(entry.totalSavings)}</div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Expenses</div>
            <div className="text-lg font-black text-rose-500 leading-none tracking-tighter">{peso(entry.totalExpenses)}</div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={e => { e.stopPropagation(); onRemove() }}
              className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-soft opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} strokeWidth={2} />
            </button>
            <div className="p-2 bg-slate-50 rounded-xl">
               {expanded ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded view for print or user */}
      {(expanded || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
        <div className={`border-t border-slate-100 p-8 bg-slate-50/30 print:bg-white print:border-none print:p-0 animate-in fade-in slide-in-from-top-2 duration-300 ${expanded ? '' : 'hidden print:block'}`}>
          {entry.mode === 'student' && entry.studentData ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm">
                   <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                      <span className="font-black text-sm tracking-tight text-indigo-600 uppercase">Campus Daily Ledger</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gross Allowance: {peso(entry.studentData.actualDailyAllowance)}</span>
                   </div>
                   <div className="space-y-1">
                      {entry.studentData.dailyExpenses.map((e, i) => (
                        <div key={i} className="flex justify-between py-3 px-3 rounded-2xl hover:bg-slate-50 transition-soft">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 truncate">{e.name}</span>
                            {e.wallet && <span className="text-[9px] font-black text-slate-400 uppercase">via {e.wallet}</span>}
                          </div>
                          <span className="font-black text-slate-900 text-sm tracking-tighter">{peso(e.actualAmount)}</span>
                        </div>
                      ))}
                   </div>
                   <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-3">
                         <span className="text-slate-400">Total Spent / Day</span>
                         <span className="text-rose-500 font-black">{peso(entry.studentData.dailyExpenses.reduce((s,x)=>s+x.actualAmount,0))}</span>
                      </div>
                   </div>
                </div>
                
                <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm">
                   <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                      <span className="font-black text-sm tracking-tight text-primary uppercase">Weekly Allocation</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Surplus: {peso(entry.studentData.weeklySurplus)}</span>
                   </div>
                   <div className="space-y-1">
                      {entry.studentData.weeklyExtras.map((e, i) => (
                        <div key={i} className="flex justify-between py-3 px-3 rounded-2xl hover:bg-slate-50 transition-soft">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700 truncate">{e.name}</span>
                              {e.wallet && <span className="text-[9px] font-black text-slate-400 uppercase">via {e.wallet}</span>}
                           </div>
                           <span className="font-black text-slate-900 text-sm tracking-tighter">{peso(e.actualAmount)}</span>
                        </div>
                      ))}
                   </div>
                   <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                         <span className="text-[9px] font-black uppercase text-primary mb-1 block">Savings</span>
                         <span className="text-xl font-black text-primary">{peso(entry.studentData.savings)}</span>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                         <span className="text-[9px] font-black uppercase text-emerald-600 mb-1 block">Buffer</span>
                         <span className="text-xl font-black text-emerald-600">{peso(entry.studentData.buffer)}</span>
                      </div>
                   </div>
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
              {[
                { title: 'Mid-Cycle Analysis (15th)', data: entry.cutoff15, color: 'text-primary' },
                { title: 'End-Cycle Analysis (30th)', data: entry.cutoff30, color: 'text-indigo-600' },
              ].map(({ title, data, color }) => (
                <div key={title} className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm print:border-slate-100 print:p-4">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <span className={`font-black text-sm tracking-tight ${color}`}>{title}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">GROSS: {peso(data?.actualIncome ?? data?.income ?? 0)}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {data?.expenses.map((e, i) => (
                      <div key={i} className="flex justify-between py-3 px-3 rounded-2xl hover:bg-slate-50 transition-soft group/item">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 truncate">{e.name}</span>
                          {e.wallet && <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">via {e.wallet}</span>}
                        </div>
                        <div className="flex gap-4 items-center shrink-0">
                          <span className="w-16 text-right text-slate-300 text-xs font-medium print:hidden">{peso(e.amount)}</span>
                          <span className="w-16 text-right font-black text-slate-900 text-sm tracking-tighter">{peso(e.actualAmount ?? e.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-3">
                      <span className="text-slate-400">Total Outflow</span>
                      <span className="text-rose-500 font-black">{peso(data?.totalActualExpenses ?? data?.totalExpenses ?? 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl text-white">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Cycle Savings</span>
                      <span className="text-lg font-black tracking-tighter">{peso(data?.savings ?? 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function HistoryTab({ history, onRemove, onClear, savingsGoal }: Props) {
  const [filterMode, setFilterMode] = useState<'all' | 'worker' | 'student'>('all')

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-slate-200 border-dashed rounded-[40px]">
        <div className="p-6 bg-slate-50 rounded-full mb-6 border border-slate-100">
           <TrendingUp size={48} strokeWidth={1} className="text-slate-200" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Portfolio History Empty</h3>
        <p className="text-sm text-slate-400 max-w-xs font-medium leading-relaxed">Save monthly summaries from your dashboard to track your long-term growth here.</p>
      </div>
    )
  }

  const filteredHistory = history.filter(e => filterMode === 'all' || e.mode === filterMode)
  const sorted = [...filteredHistory].sort((a, b) => a.month.localeCompare(b.month))
  const cumData = sorted.reduce<{ label: string; savings: number; expenses: number; cumulative: number }[]>((acc, e) => {
    const prev = acc[acc.length - 1]?.cumulative || 0
    acc.push({ label: e.label, savings: e.totalSavings, expenses: e.totalExpenses, cumulative: prev + e.totalSavings })
    return acc
  }, [])

  const totalSaved = (filteredHistory || []).reduce((s, e) => s + (e.totalSavings || 0), 0)
  const totalSpent = (filteredHistory || []).reduce((s, e) => s + (e.totalExpenses || 0), 0)
  const avgSavings = filteredHistory.length > 0 ? Math.round(totalSaved / filteredHistory.length) : 0
  
  // Use the appropriate goal: worker goal is passed as prop, student has its own but we'll use a heuristic 
  // or just the prop if 'all'.
  const currentGoal = filterMode === 'student' ? 5000 : savingsGoal 
  const goalPct = currentGoal > 0 ? Math.min(100, Math.round((totalSaved / currentGoal) * 100)) : 0

  return (
    <div className="space-y-10 print:space-y-4 pb-20">
      {/* Export Section */}
      <div className="bg-slate-900 rounded-[32px] p-8 shadow-2xl shadow-slate-200 border border-slate-800 flex flex-wrap justify-between items-center gap-8 print:hidden relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-20 -mt-20 blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3.5 bg-white/10 text-primary rounded-2xl border border-white/5 backdrop-blur-md shadow-inner">
            <Download size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-xl font-black text-white tracking-tight leading-none mb-2">Portfolio History</h4>
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mt-1">
               <button 
                onClick={() => setFilterMode('all')}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-soft ${filterMode === 'all' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
               >
                 All
               </button>
               <button 
                onClick={() => setFilterMode('worker')}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-soft ${filterMode === 'worker' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
               >
                 Dashboard
               </button>
               <button 
                onClick={() => setFilterMode('student')}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-soft ${filterMode === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
               >
                 Student
               </button>
            </div>
          </div>
        </div>
        <div className="flex gap-4 relative z-10">
           <button
            onClick={() => exportToCSV(history)}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-soft"
          >
            <Download size={16} /> Spreadsheet
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-soft shadow-lg shadow-primary/20 active:scale-95"
          >
            <Printer size={16} /> Print Reports
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: filterMode === 'all' ? 'Active Records' : `${filterMode === 'worker' ? 'Dashboard' : 'Student'} Reports`, value: filteredHistory.length.toString(), color: 'text-slate-900', icon: Calendar },
          { label: 'Net Accumulation', value: peso(totalSaved), color: 'text-primary', icon: PiggyBank },
          { label: 'External Outflow', value: peso(totalSpent), color: 'text-rose-600', icon: Receipt },
          { label: 'Mean Yield', value: peso(avgSavings), color: 'text-emerald-600', icon: TrendingUp },
        ].map(m => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-primary/20 transition-soft group">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-soft">
                <m.icon size={16} strokeWidth={1.5} className="text-slate-400 group-hover:text-primary transition-soft" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none group-hover:text-slate-600 transition-soft">{m.label}</span>
            </div>
            <div className={`text-2xl font-black ${m.color} tracking-tight`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Goal Progress with Milestones */}
      <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Wealth Goal Progression</span>
            <div className="flex items-baseline gap-4">
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">{peso(totalSaved)}</h2>
              <span className="text-lg font-bold text-slate-400">/ {peso(currentGoal)} Target</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
               Current Status: {goalPct}% Efficiency
             </div>
          </div>
        </div>
        
        <div className="relative pt-4 pb-12">
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner border border-slate-200/50">
            <div 
              className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000 ease-out shadow-[0_4px_12px_rgba(59,130,246,0.3)]" 
              style={{ width: `${goalPct}%` }} 
            />
          </div>
          
          {/* Milestone Markers */}
          {[25, 50, 75, 100].map(m => (
            <div 
              key={m}
              className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
              style={{ left: `${m}%` }}
            >
              <div className={`w-0.5 h-8 ${goalPct >= m ? 'bg-primary' : 'bg-slate-200'} transition-all duration-700`} />
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <span className={`text-[10px] font-black tracking-widest transition-colors ${goalPct >= m ? 'text-primary' : 'text-slate-400'}`}>
                  {m}%
                </span>
                {goalPct >= m && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-10 border-t border-slate-50">
           {[25, 50, 75, 100].map(m => {
             const milestoneAmt = savingsGoal * (m / 100)
             const isReached = totalSaved >= milestoneAmt
             return (
               <div key={m} className={`flex flex-col p-5 rounded-[24px] border transition-soft ${
                 isReached 
                   ? 'bg-emerald-50/[0.15] border-emerald-100 shadow-sm' 
                   : 'bg-slate-50/30 border-slate-100 opacity-60'
               }`}>
                 <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${isReached ? 'text-emerald-500' : 'text-slate-400'}`}>
                   PHASE {m}%
                 </span>
                 <span className={`text-sm font-black tracking-tight ${isReached ? 'text-emerald-700' : 'text-slate-600'}`}>
                   {peso(milestoneAmt)}
                 </span>
                 {isReached && (
                   <div className="flex items-center gap-1.5 mt-2">
                     <div className="w-1 h-1 rounded-full bg-emerald-500" />
                     <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Achieved</span>
                   </div>
                 )}
               </div>
             )
           })}
        </div>
      </div>

      {/* Analytics Chart */}
      {cumData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
             <div className="p-3 bg-primary/5 text-primary rounded-2xl border border-primary/10">
                <TrendingUp size={20} strokeWidth={1.5} />
             </div>
             <h3 className="text-lg font-black text-slate-900 tracking-tight">Growth Trajectory Analytics</h3>
          </div>
          <div style={{ height: 320 }} className="mr-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumData} margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '12px 16px'
                  }} 
                  formatter={(v) => typeof v === 'number' ? peso(v) : v} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  name="Net Wealth" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  name="Cycle Yield" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History List */}
      <div>
        <div className="flex justify-between items-center mb-8 px-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{filterMode === 'worker' ? 'Dashboard' : filterMode} log ({filteredHistory.length})</h3>
          <button
            onClick={onClear}
            className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-rose-500 flex items-center gap-2 transition-soft"
          >
            <Trash2 size={12} strokeWidth={2} /> Wipe Database
          </button>
        </div>
        <div className="space-y-4">
          {filteredHistory.sort((a, b) => b.month.localeCompare(a.month)).map(e => (
            <HistoryCard key={e.id} entry={e} onRemove={() => onRemove(e.id)} />
          ))}
          {filteredHistory.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No {filterMode} records found</p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .max-w-6xl { max-width: 100% !important; margin: 0 !important; width: 100% !important; }
          footer, nav, header, button, .recharts-responsive-container, .print\:hidden { display: none !important; }
          .print\:block { display: block !important; }
          .print\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          @page { margin: 15mm; }
        }
      `}</style>
    </div>
  )
}
