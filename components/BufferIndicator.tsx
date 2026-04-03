'use client'
import { Coffee, Info, Utensils, ShoppingBag, Zap } from 'lucide-react'
import { peso } from '@/lib/calc'

interface BufferIndicatorProps {
  totalBuffer: number
  days?: number
  label?: string
}

export default function BufferIndicator({ totalBuffer, days = 30, label = 'Monthly' }: BufferIndicatorProps) {
  const dailyBuffer = totalBuffer / days
  const isHealthy = dailyBuffer > 500
  const isWarning = dailyBuffer > 0 && dailyBuffer <= 200
  const isCritical = dailyBuffer <= 0

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[32px] blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="relative bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm overflow-hidden transition-soft hover:border-emerald-200">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-50 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <Zap size={18} className="text-emerald-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Safe-to-Spend</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label} Freedom Fund</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{peso(dailyBuffer)}</span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">/ Day</span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                You can spend this amount daily without touching your savings or bills.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-[200px]">
             <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
               isCritical ? 'bg-rose-50 border-rose-100 text-rose-700' :
               isWarning ? 'bg-amber-50 border-amber-100 text-amber-700' :
               'bg-emerald-50 border-emerald-100 text-emerald-700'
             }`}>
               <Info size={16} className="shrink-0 mt-0.5" />
               <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest block">The Verdict</span>
                  <p className="text-[11px] font-bold leading-tight">
                    {isCritical ? 'You are over budget! Avoid unnecessary spending.' :
                     isWarning ? 'Budget is tight. Limit spending to essentials.' :
                     'Your budget is healthy! You have room for extras.'}
                  </p>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                   <div className="flex items-center gap-1.5 grayscale opacity-60">
                      <Coffee size={12} className="text-amber-700" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Coffee Test</span>
                   </div>
                   <span className={`text-[10px] font-black ${dailyBuffer >= 150 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {dailyBuffer >= 150 ? 'Safe' : 'Pass'}
                   </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                   <div className="flex items-center gap-1.5 grayscale opacity-60">
                      <Utensils size={12} className="text-blue-600" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Dining Out</span>
                   </div>
                   <span className={`text-[10px] font-black ${dailyBuffer >= 500 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {dailyBuffer >= 500 ? 'Safe' : 'Careful'}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
