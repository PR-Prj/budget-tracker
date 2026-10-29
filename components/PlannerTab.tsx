'use client'
import { FormEvent, useState } from 'react'
import { CalendarDays, Check, CircleDollarSign, Plus, Trash2 } from 'lucide-react'
import { peso } from '@/lib/calc'
import { Settings } from '@/lib/types'

interface Props {
  settings: Settings
  onUpdate: (settings: Settings) => void
}

export default function PlannerTab({ settings, onUpdate }: Props) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('1')
  const [category, setCategory] = useState('Bills')
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  function addBill(e: FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!name.trim() || value <= 0) return
    onUpdate({
      ...settings,
      bills: [...(settings.bills || []), {
        id: `bill-${Date.now()}`,
        name: name.trim(),
        amount: value,
        dueDay: Math.max(1, Math.min(31, Number(dueDay) || 1)),
        category: category.trim() || 'Bills',
      }],
    })
    setName('')
    setAmount('')
  }

  function togglePaid(id: string) {
    const payments = { ...(settings.billPayments || {}) }
    const months = payments[id] || []
    payments[id] = months.includes(monthKey) ? months.filter(m => m !== monthKey) : [...months, monthKey]
    onUpdate({ ...settings, billPayments: payments })
  }

  function updateJar(id: string, changes: { currentAmount?: number; targetDate?: string }, student = false) {
    if (student) {
      const jars = settings.studentConfig.savingsJars || []
      onUpdate({ ...settings, studentConfig: { ...settings.studentConfig, savingsJars: jars.map(jar => jar.id === id ? { ...jar, ...changes } : jar) } })
    } else {
      onUpdate({ ...settings, savingsJars: settings.savingsJars.map(jar => jar.id === id ? { ...jar, ...changes } : jar) })
    }
  }

  function removeBill(id: string) {
    const payments = { ...(settings.billPayments || {}) }
    delete payments[id]
    onUpdate({ ...settings, bills: settings.bills.filter(bill => bill.id !== id), billPayments: payments })
  }

  const today = now.getDate()
  const totalDue = (settings.bills || []).reduce((sum, bill) => {
    return (settings.billPayments?.[bill.id] || []).includes(monthKey) ? sum : sum + bill.amount
  }, 0)

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Bills & savings goals</h1>
        <p className="mt-1 text-sm text-slate-500">Track monthly due dates and update how much you have saved toward each goal.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><CalendarDays size={18} /></div>
            <div><h2 className="font-bold text-slate-900">Monthly bills</h2><p className="text-xs text-slate-500">{now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p></div>
          </div>
          <div className="text-right"><div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Unpaid this month</div><div className="font-black text-amber-600">{peso(totalDue)}</div></div>
        </div>
        <form onSubmit={addBill} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-2xl mb-4">
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="Bill name" className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Amount (₱)" className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} aria-label="Due day of month" placeholder="Due day" className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700"><Plus size={16} /> Add bill</button>
        </form>
        {(settings.bills || []).length === 0 ? <p className="py-6 text-center text-sm text-slate-400">No bills added yet.</p> : (
          <div className="divide-y divide-slate-100">
            {settings.bills.map(bill => {
              const paid = (settings.billPayments?.[bill.id] || []).includes(monthKey)
              const dueDate = Math.min(bill.dueDay, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())
              const overdue = !paid && dueDate < today
              const dueSoon = !paid && !overdue && dueDate - today <= 3
              return <div key={bill.id} className="flex items-center gap-3 py-4">
                <button onClick={() => togglePaid(bill.id)} aria-label={paid ? `Mark ${bill.name} unpaid` : `Mark ${bill.name} paid`} className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border ${paid ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300'}`}><Check size={17} /></button>
                <div className="min-w-0 flex-1"><div className={`font-bold text-sm ${paid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{bill.name}</div><div className="text-xs text-slate-400">{bill.category} · Due day {dueDate}{overdue && <span className="ml-2 text-rose-500 font-bold">Overdue</span>}{dueSoon && <span className="ml-2 text-amber-600 font-bold">Due soon</span>}</div></div>
                <div className="text-sm font-black text-slate-800">{peso(bill.amount)}</div>
                <button onClick={() => removeBill(bill.id)} aria-label={`Remove ${bill.name}`} className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-lg"><Trash2 size={15} /></button>
              </div>
            })}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5"><div className="p-2.5 rounded-xl bg-primary/10 text-primary"><CircleDollarSign size={18} /></div><div><h2 className="font-bold text-slate-900">Savings goals</h2><p className="text-xs text-slate-500">Update the saved amount to see your progress.</p></div></div>
        {settings.savingsJars.length === 0 && !(settings.studentConfig.savingsJars || []).length ? <p className="py-6 text-center text-sm text-slate-400">Add savings jars in Settings to track goals here.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...settings.savingsJars.map(jar => ({ ...jar, goalGroup: 'Main budget', isStudent: false })), ...(settings.studentConfig.savingsJars || []).map(jar => ({ ...jar, goalGroup: 'Student budget', isStudent: true }))].map(jar => {
            const saved = jar.currentAmount || 0
            const progress = jar.targetAmount > 0 ? Math.min(100, (saved / jar.targetAmount) * 100) : 0
            return <div key={jar.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-start justify-between gap-3"><div><span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">{jar.goalGroup}</span><h3 className="font-bold text-slate-800">{jar.name || 'Savings goal'}</h3><p className="text-xs text-slate-500 mt-1">Target {peso(jar.targetAmount)}</p></div><span className="text-sm font-black text-primary">{Math.round(progress)}%</span></div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden my-4"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Saved so far<div className="relative mt-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₱</span><input type="number" min="0" value={jar.currentAmount ?? ''} onChange={e => updateJar(jar.id, { currentAmount: Number(e.target.value) || 0 }, jar.isStudent)} placeholder="0" className="w-full pl-7 pr-2 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800" /></div></label>
                <label className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Target date<input type="date" value={jar.targetDate || ''} onChange={e => updateJar(jar.id, { targetDate: e.target.value }, jar.isStudent)} className="w-full mt-1 px-2 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" /></label>
              </div>
            </div>
          })}
        </div>}
      </section>
    </div>
  )
}
