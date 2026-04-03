'use client'
import { useState } from 'react'
import { Settings, CustomExpense, AdditionalPayment, StudentConfig, SavingsJar } from '@/lib/types'
import { Plus, Trash2, Info, Briefcase, GraduationCap, Coins, ChevronRight, PieChart, Wallet, CreditCard, PiggyBank } from 'lucide-react'

interface Props {
  settings: Settings
  onUpdate: (s: Settings) => void
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">{children}</h3>
}

const WALLETS = ['Gcash', 'Maya', 'Cash', 'Bank', 'BPI', 'BDO', 'Seabank', 'Gotyme']

function WalletSelector({ 
  value, onChange, className = '' 
}: { 
  value?: string, onChange: (v: string) => void, className?: string 
}) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className={`text-[9px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer hover:bg-white transition-soft ${className}`}
    >
      <option value="">WALLET</option>
      {WALLETS.map(w => <option key={w} value={w}>{w}</option>)}
    </select>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm shadow-slate-200/50 ${className}`}>{children}</div>
}

function FieldRow({
  label, sublabel, value, wallet, onChange, onWalletChange, onLabelChange, onDelete
}: {
  label: string; sublabel?: string; value: number; wallet?: string; 
  onChange: (v: number) => void; onWalletChange?: (w: string) => void;
  onLabelChange?: (l: string) => void; onDelete?: () => void
}) {
  return (
    <div className="flex flex-row items-center justify-between py-4 border-t border-slate-50 first:border-t-0 gap-4 overflow-hidden group/row transition-soft">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          {onLabelChange ? (
            <input 
              type="text" 
              value={label} 
              onChange={e => onLabelChange(e.target.value)}
              placeholder="Expense name"
              className="text-sm text-slate-900 truncate font-semibold bg-transparent border-none p-0 focus:ring-0 w-32 md:w-48 placeholder:text-slate-300"
            />
          ) : (
            <div className="text-sm text-slate-700 truncate font-semibold">{label}</div>
          )}
          {onWalletChange && <WalletSelector value={wallet} onChange={onWalletChange} />}
        </div>
        {sublabel && <div className="text-[10px] text-slate-400 font-medium mt-0.5">{sublabel}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₱</span>
          <input
            type="number"
            value={value || ''}
            min={0}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            className="w-28 text-right pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary text-slate-900 font-bold placeholder:text-slate-300 transition-soft"
          />
        </div>
        {onDelete && (
          <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-soft md:opacity-0 md:group-hover/row:opacity-100">
            <Trash2 size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )
}

function CustomExpenseList({
  items, onUpdate, cutoff, type
}: {
  items: CustomExpense[]
  onUpdate: (items: CustomExpense[]) => void
  cutoff: '15' | '30'
  type: 'base' | 'heavy'
}) {
  function add() {
    onUpdate([...items, { id: `${cutoff}-${type}-${Date.now()}`, name: '', amount: 0, isHeavyOnly: type === 'heavy' }])
  }
  function remove(id: string) {
    onUpdate(items.filter(e => e.id !== id))
  }
  function update(id: string, field: keyof CustomExpense, val: string | number | boolean) {
    onUpdate(items.map(e => e.id === id ? { ...e, [field]: val } : e))
  }

  const filtered = items.filter(e => e.isHeavyOnly === (type === 'heavy'))

  return (
    <div className="space-y-4">
      {filtered.map(e => (
        <div key={e.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl transition-soft group hover:border-primary/20 hover:bg-white">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="text"
              placeholder="Custom item name"
              value={e.name}
              onChange={ev => update(e.id, 'name', ev.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 font-semibold placeholder:text-slate-300 transition-soft shadow-sm"
            />
            <button onClick={() => remove(e.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-soft">
              <Trash2 size={16} strokeWidth={2} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <WalletSelector value={e.wallet} onChange={v => update(e.id, 'wallet', v)} />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₱</span>
              <input
                type="number"
                placeholder="0"
                value={e.amount || ''}
                min={0}
                onChange={ev => update(e.id, 'amount', parseFloat(ev.target.value) || 0)}
                className="w-32 text-right pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 font-bold placeholder:text-slate-300 shadow-sm transition-soft"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300 transition-soft active:scale-95"
      >
        <Plus size={14} strokeWidth={2.5} /> Add Custom Breakdown
      </button>
    </div>
  )
}

function SavingsJarList({
  jars = [], onUpdate, addButtonLabel = "Add Savings Pot"
}: {
  jars?: SavingsJar[]
  onUpdate: (items: SavingsJar[]) => void
  addButtonLabel?: string
}) {
  function add() {
    onUpdate([...(jars || []), { id: `jar-${Date.now()}`, name: '', targetAmount: 0, splitPercent: 0 }])
  }
  function remove(id: string) {
    onUpdate((jars || []).filter(j => j.id !== id))
  }
  function update(id: string, field: keyof SavingsJar, val: string | number) {
    onUpdate((jars || []).map(j => j.id === id ? { ...j, [field]: val } : j))
  }

  const totalSplit = (jars || []).reduce((s, j) => s + j.splitPercent, 0)

  return (
    <div className="space-y-4">
      {jars.map(j => (
        <div key={j.id} className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl relative group hover:border-primary/20 hover:bg-white transition-soft">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                <Coins size={16} className="text-primary" />
              </div>
              <input
                type="text"
                placeholder="Pot Name (e.g. Dream House)"
                value={j.name}
                onChange={ev => update(j.id, 'name', ev.target.value)}
                className="flex-1 text-sm font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300"
              />
              <button 
                onClick={() => remove(j.id)} 
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-soft md:opacity-0 md:group-hover:opacity-100"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₱</span>
                  <input
                    type="number"
                    value={j.targetAmount || ''}
                    onChange={ev => update(j.id, 'targetAmount', parseFloat(ev.target.value) || 0)}
                    className="w-full text-right pl-7 pr-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-soft outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Split Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    value={j.splitPercent || ''}
                    onChange={ev => update(j.id, 'splitPercent', parseFloat(ev.target.value) || 0)}
                    className="w-full text-right pr-7 pl-3 py-2 text-xs font-bold text-primary bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-soft outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 transition-soft active:scale-95"
      >
        <Plus size={16} strokeWidth={2.5} /> {addButtonLabel}
      </button>
      {jars.length > 0 && (
        <div className={`text-[10px] font-bold uppercase tracking-widest text-center py-2 rounded-xl border ${
          totalSplit === 100 
            ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
            : 'text-amber-600 bg-amber-50 border-amber-100'
        }`}>
          Current Allocation Pool: {totalSplit}% {totalSplit !== 100 ? `(Requires 100%)` : '(Optimized)'}
        </div>
      )}
    </div>
  )
}

function AdditionalPaymentList({
  items, onUpdate
}: {
  items: AdditionalPayment[]
  onUpdate: (items: AdditionalPayment[]) => void
}) {
  function add() {
    onUpdate([...items, { id: `ap-${Date.now()}`, month: '', cutoff15: 0, cutoff30: 0 }])
  }
  function remove(id: string) {
    onUpdate(items.filter(e => e.id !== id))
  }
  function update(id: string, field: keyof AdditionalPayment, val: string | number) {
    onUpdate(items.map(e => e.id === id ? { ...e, [field]: val } : e))
  }

  return (
    <div className="space-y-4">
      {items.map(e => (
        <div key={e.id} className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl relative group hover:border-primary/20 transition-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Event/Label</label>
              <input
                type="text"
                placeholder="e.g. Performance Bonus"
                value={e.month}
                onChange={ev => update(e.id, 'month', ev.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 font-semibold placeholder:text-slate-300 shadow-sm transition-soft"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">15th Part</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₱</span>
                  <input
                    type="number"
                    value={e.cutoff15 || ''}
                    onChange={ev => update(e.id, 'cutoff15', parseFloat(ev.target.value) || 0)}
                    className="w-full text-right pl-7 pr-3 py-2 text-sm font-bold text-slate-900 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 transition-soft outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">30th Part</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₱</span>
                  <input
                    type="number"
                    value={e.cutoff30 || ''}
                    onChange={ev => update(e.id, 'cutoff30', parseFloat(ev.target.value) || 0)}
                    className="w-full text-right pl-7 pr-3 py-2 text-sm font-bold text-slate-900 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 transition-soft outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => remove(e.id)} 
            className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-slate-300 rounded-full shadow-lg flex items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-soft scale-90 group-hover:scale-100"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-[0.2em] text-primary bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl hover:bg-primary/10 transition-soft active:scale-95"
      >
        <Plus size={16} strokeWidth={2.5} /> Register One-Time Income
      </button>
    </div>
  )
}

function DynamicRecordList({
  items, wallets, onUpdate, onWalletUpdate, syncWallet, addButtonLabel
}: {
  items: Record<string, number>
  wallets?: Record<string, string>
  onUpdate: (items: Record<string, number>) => void
  onWalletUpdate?: (wallets: Record<string, string>) => void
  syncWallet?: (name: string, wallet: string) => void
  addButtonLabel: string
}) {
  function add() {
    const name = window.prompt('Expense name?')
    if (name) onUpdate({ ...items, [name]: 0 })
  }
  function remove(key: string) {
    const next = { ...items }
    delete next[key]
    onUpdate(next)
    if (onWalletUpdate && wallets) {
      const nextW = { ...wallets }
      delete nextW[key]
      onWalletUpdate(nextW)
    }
  }
  function updateVal(key: string, val: number) {
    onUpdate({ ...items, [key]: val })
  }
  function updateKey(oldKey: string, newKey: string) {
    if (!newKey || newKey === oldKey) return
    const next = { ...items }
    const val = next[oldKey]
    delete next[oldKey]
    next[newKey] = val
    onUpdate(next)
    
    if (onWalletUpdate && wallets) {
      const nextW = { ...wallets }
      const w = nextW[oldKey]
      delete nextW[oldKey]
      if (w) nextW[newKey] = w
      onWalletUpdate(nextW)
    }
  }

  function handleWalletChange(k: string, w: string) {
    if (syncWallet) {
      syncWallet(k, w)
    } else if (onWalletUpdate && wallets) {
      onWalletUpdate({ ...wallets, [k]: w })
    }
  }

  return (
    <div>
      {Object.entries(items).map(([k, v]) => (
        <FieldRow 
          key={k} 
          label={k} 
          value={v} 
          wallet={wallets?.[k]}
          onChange={val => updateVal(k, val)}
          onWalletChange={w => handleWalletChange(k, w)}
          onLabelChange={newK => updateKey(k, newK)}
          onDelete={() => remove(k)}
        />
      ))}
      <button
        onClick={add}
        className="mt-6 w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition-soft active:scale-95"
      >
        <Plus size={14} strokeWidth={2.5} /> {addButtonLabel}
      </button>
    </div>
  )
}

function StudentSettingsEditor({
  config, onUpdate, syncWallet
}: {
  config: StudentConfig
  onUpdate: (c: StudentConfig) => void
  syncWallet: (name: string, wallet: string) => void
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <CreditCard size={18} />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight">Main Allowance</span>
          </div>
          <div className="space-y-1">
            <FieldRow label="Daily Amount" value={config.dailyAllowance}
              onChange={v => onUpdate({ ...config, dailyAllowance: v })} />
            <FieldRow label="Days per Cycle" sublabel="School days in current budget period" value={config.schoolDaysPerWeek}
              onChange={v => onUpdate({ ...config, schoolDaysPerWeek: v })} />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <PiggyBank size={18} />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight">Savings Strategy</span>
          </div>
          <div className="space-y-1">
            <FieldRow label="Global Goal" value={config.savingsGoal || 0}
              onChange={v => onUpdate({ ...config, savingsGoal: v })} />
            <div className="flex items-center justify-between py-5 border-t border-slate-50 gap-6">
              <div className="text-sm text-slate-700 font-semibold">Allocation %</div>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={10} max={95} step={5}
                  value={config.savingsSplit || 70}
                  onChange={e => onUpdate({ ...config, savingsSplit: Number(e.target.value) })}
                  className="w-24 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm font-black text-primary w-12 text-right">{config.savingsSplit || 70}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <SectionTitle>Recurrent Campus Costs</SectionTitle>
          <Card>
            <DynamicRecordList 
              items={config.baseDailyExpenses || {}}
              wallets={config.expenseWallets}
              onUpdate={items => onUpdate({ ...config, baseDailyExpenses: items })}
              syncWallet={syncWallet}
              addButtonLabel="Add Daily Item"
            />
          </Card>
        </div>
        <div className="space-y-4">
          <SectionTitle>Recurring Misc Costs</SectionTitle>
          <Card>
            <DynamicRecordList 
              items={config.weeklySchoolExtra || {}}
              wallets={config.expenseWallets}
              onUpdate={items => onUpdate({ ...config, weeklySchoolExtra: items })}
              syncWallet={syncWallet}
              addButtonLabel="Add Extra Item"
            />
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Educational Fund Pools</SectionTitle>
        <Card>
          <SavingsJarList 
            jars={config.savingsJars || []} 
            onUpdate={jars => onUpdate({ ...config, savingsJars: jars })} 
            addButtonLabel="Create New Student Jar"
          />
        </Card>
      </div>

      <div className="space-y-4">
        <SectionTitle>Specific Academic Items</SectionTitle>
        <Card>
          <CustomExpenseList
            items={config.customExpenses || []}
            onUpdate={items => onUpdate({ ...config, customExpenses: items })}
            cutoff="15" type="base"
          />
        </Card>
      </div>
    </div>
  )
}

export default function SettingsPanel({ settings, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'worker' | 'student'>('worker')

  function set15Base(key: string, val: number) {
    onUpdate({ ...settings, cutoff15: { ...settings.cutoff15, baseExpenses: { ...settings.cutoff15.baseExpenses, [key]: val } } })
  }
  function set15Heavy(key: string, val: number) {
    onUpdate({ ...settings, cutoff15: { ...settings.cutoff15, heavyExpenses: { ...settings.cutoff15.heavyExpenses, [key]: val } } })
  }
  function set30Base(key: string, val: number) {
    onUpdate({ ...settings, cutoff30: { ...settings.cutoff30, baseExpenses: { ...settings.cutoff30.baseExpenses, [key]: val } } })
  }
  function set30Heavy(key: string, val: number) {
    onUpdate({ ...settings, cutoff30: { ...settings.cutoff30, heavyExpenses: { ...settings.cutoff30.heavyExpenses, [key]: val } } })
  }
  function setCustom15(items: CustomExpense[]) {
    onUpdate({ ...settings, cutoff15: { ...settings.cutoff15, customExpenses: items } })
  }
  function setCustom30(items: CustomExpense[]) {
    onUpdate({ ...settings, cutoff30: { ...settings.cutoff30, customExpenses: items } })
  }

  const handleKeyChange = (cutoff: '15' | '30', type: 'base' | 'heavy', oldKey: string, newKey: string) => {
    if (!newKey || newKey === oldKey) return
    const cfgKey = cutoff === '15' ? 'cutoff15' : 'cutoff30'
    const typeKey = type === 'base' ? 'baseExpenses' : 'heavyExpenses'
    const targetCfg = settings[cfgKey]
    
    const nextExpenses = { ...targetCfg[typeKey] }
    const nextWallets = { ...targetCfg.expenseWallets }
    const val = nextExpenses[oldKey]
    
    delete nextExpenses[oldKey]
    nextExpenses[newKey] = val
    
    const w = nextWallets[oldKey]
    delete nextWallets[oldKey]
    if (w) nextWallets[newKey] = w
    
    onUpdate({
      ...settings,
      [cfgKey]: { ...targetCfg, [typeKey]: nextExpenses, expenseWallets: nextWallets }
    })
  }

  const handleRemoval = (cutoff: '15' | '30', type: 'base' | 'heavy', key: string) => {
    const cfgKey = cutoff === '15' ? 'cutoff15' : 'cutoff30'
    const typeKey = type === 'base' ? 'baseExpenses' : 'heavyExpenses'
    const targetCfg = settings[cfgKey]
    
    const nextExpenses = { ...targetCfg[typeKey] }
    delete nextExpenses[key]
    
    onUpdate({
      ...settings,
      [cfgKey]: { ...targetCfg, [typeKey]: nextExpenses }
    })
  }

  const syncWallet = (name: string, wallet: string) => {
    const next15 = { ...settings.cutoff15.expenseWallets, [name]: wallet }
    const next30 = { ...settings.cutoff30.expenseWallets, [name]: wallet }
    const nextStudent = { ...settings.studentConfig.expenseWallets, [name]: wallet }
    
    const syncCustom = (items: CustomExpense[]) => items.map(e => e.name === name ? { ...e, wallet } : e)

    onUpdate({
      ...settings,
      cutoff15: { 
        ...settings.cutoff15, 
        expenseWallets: next15, 
        customExpenses: syncCustom(settings.cutoff15.customExpenses) 
      },
      cutoff30: { 
        ...settings.cutoff30, 
        expenseWallets: next30, 
        customExpenses: syncCustom(settings.cutoff30.customExpenses) 
      },
      studentConfig: { 
        ...settings.studentConfig, 
        expenseWallets: nextStudent,
        customExpenses: syncCustom(settings.studentConfig.customExpenses || [])
      }
    })
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('worker')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-soft ${
            activeTab === 'worker' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase size={16} strokeWidth={2} />
          Professional
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-soft ${
            activeTab === 'student' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap size={16} strokeWidth={2} />
          Academic
        </button>
      </div>

      {activeTab === 'worker' ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <SectionTitle>Base Income (15th)</SectionTitle>
              <FieldRow label="Est. Net Pay" value={settings.cutoff15.income} 
                onChange={v => onUpdate({ ...settings, cutoff15: { ...settings.cutoff15, income: v } })} />
            </Card>
            <Card>
              <SectionTitle>Base Income (30th)</SectionTitle>
              <FieldRow label="Est. Net Pay" value={settings.cutoff30.income}
                onChange={v => onUpdate({ ...settings, cutoff30: { ...settings.cutoff30, income: v } })} />
            </Card>
            <Card>
              <SectionTitle>Global Financial Goal</SectionTitle>
              <FieldRow label="Savings Target" value={settings.savingsGoal}
                onChange={v => onUpdate({ ...settings, savingsGoal: v })} />
              <div className="flex items-center justify-between py-5 border-t border-slate-50 gap-6">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-widest">Base Rate</div>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min={10} max={95} step={5}
                    value={settings.savingsSplit}
                    onChange={e => onUpdate({ ...settings, savingsSplit: Number(e.target.value) })}
                    className="w-24 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-sm font-black text-primary w-12 text-right">{settings.savingsSplit}%</span>
                </div>
              </div>
            </Card>
            
            <div className="md:col-span-3 space-y-4">
              <SectionTitle>Automated Savings Allocation</SectionTitle>
              <Card>
                <SavingsJarList 
                  jars={settings.savingsJars || []} 
                  onUpdate={jars => onUpdate({ ...settings, savingsJars: jars })} 
                />
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>One-Time & Special Income</SectionTitle>
            <Card>
               <AdditionalPaymentList
                items={settings.additionalPayments}
                onUpdate={items => onUpdate({ ...settings, additionalPayments: items })}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-px bg-slate-200 flex-1" />
                 <SectionTitle>15TH CYCLE CONFIGURATION</SectionTitle>
                 <div className="h-px bg-slate-200 flex-1" />
              </div>
              <Card>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                       <CreditCard size={16} className="text-slate-400" />
                    </div>
                    <span className="text-sm font-black text-slate-900 tracking-tight">Essential Allocations</span>
                  </div>
                  <button onClick={() => set15Base('New Expense', 0)} className="p-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-soft active:scale-90"><Plus size={16} strokeWidth={2.5} /></button>
                </div>
                {Object.entries(settings.cutoff15.baseExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} 
                    wallet={settings.cutoff15.expenseWallets?.[k]}
                    onWalletChange={w => syncWallet(k, w)}
                    onLabelChange={newK => handleKeyChange('15', 'base', k, newK)}
                    onDelete={() => handleRemoval('15', 'base', k)}
                    onChange={val => set15Base(k, val)} />
                ))}
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <CustomExpenseList items={settings.cutoff15.customExpenses} onUpdate={setCustom15} cutoff="15" type="base" />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-amber-600">
                    <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl">
                       <PieChart size={16} />
                    </div>
                    <span className="text-sm font-black tracking-tight">Heavy Extras</span>
                  </div>
                  <button onClick={() => set15Heavy('Heavy Item', 0)} className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-soft active:scale-90"><Plus size={16} strokeWidth={2.5} /></button>
                </div>
                {Object.entries(settings.cutoff15.heavyExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} 
                    wallet={settings.cutoff15.expenseWallets?.[k]}
                    onWalletChange={w => syncWallet(k, w)}
                    onLabelChange={newK => handleKeyChange('15', 'heavy', k, newK)}
                    onDelete={() => handleRemoval('15', 'heavy', k)}
                    onChange={val => set15Heavy(k, val)} />
                ))}
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <CustomExpenseList items={settings.cutoff15.customExpenses} onUpdate={setCustom15} cutoff="15" type="heavy" />
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-px bg-slate-200 flex-1" />
                 <SectionTitle>30TH CYCLE CONFIGURATION</SectionTitle>
                 <div className="h-px bg-slate-200 flex-1" />
              </div>
              <Card>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                       <CreditCard size={16} className="text-slate-400" />
                    </div>
                    <span className="text-sm font-black text-slate-900 tracking-tight">Essential Allocations</span>
                  </div>
                  <button onClick={() => set30Base('New Expense', 0)} className="p-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-soft active:scale-90"><Plus size={16} strokeWidth={2.5} /></button>
                </div>
                {Object.entries(settings.cutoff30.baseExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} 
                    wallet={settings.cutoff30.expenseWallets?.[k]}
                    onWalletChange={w => syncWallet(k, w)}
                    onLabelChange={newK => handleKeyChange('30', 'base', k, newK)}
                    onDelete={() => handleRemoval('30', 'base', k)}
                    onChange={val => set30Base(k, val)} />
                ))}
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <CustomExpenseList items={settings.cutoff30.customExpenses} onUpdate={setCustom30} cutoff="30" type="base" />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-amber-600">
                    <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl">
                       <PieChart size={16} />
                    </div>
                    <span className="text-sm font-black tracking-tight">Heavy Extras</span>
                  </div>
                  <button onClick={() => set30Heavy('Heavy Item', 0)} className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-soft active:scale-90"><Plus size={16} strokeWidth={2.5} /></button>
                </div>
                {Object.entries(settings.cutoff30.heavyExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} 
                    wallet={settings.cutoff30.expenseWallets?.[k]}
                    onWalletChange={w => syncWallet(k, w)}
                    onLabelChange={newK => handleKeyChange('30', 'heavy', k, newK)}
                    onDelete={() => handleRemoval('30', 'heavy', k)}
                    onChange={val => set30Heavy(k, val)} />
                ))}
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <CustomExpenseList items={settings.cutoff30.customExpenses} onUpdate={setCustom30} cutoff="30" type="heavy" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <StudentSettingsEditor
          config={settings.studentConfig}
          onUpdate={c => onUpdate({ ...settings, studentConfig: c })}
          syncWallet={syncWallet}
        />
      )}
    </div>
  )
}
