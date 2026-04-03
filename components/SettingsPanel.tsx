'use client'
import { useState } from 'react'
import { Settings, CustomExpense, AdditionalPayment, StudentConfig } from '@/lib/types'
import { Plus, Trash2, Info, Briefcase, GraduationCap } from 'lucide-react'

interface Props {
  settings: Settings
  onUpdate: (s: Settings) => void
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{children}</h3>
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
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200 bg-white text-gray-500 uppercase tracking-tighter outline-none focus:ring-2 focus:ring-blue-300 ${className}`}
    >
      <option value="">Wallet?</option>
      {WALLETS.map(w => <option key={w} value={w}>{w}</option>)}
    </select>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 ${className}`}>{children}</div>
}

function FieldRow({
  label, sublabel, value, wallet, onChange, onWalletChange, onLabelChange, onDelete
}: {
  label: string; sublabel?: string; value: number; wallet?: string; 
  onChange: (v: number) => void; onWalletChange?: (w: string) => void;
  onLabelChange?: (l: string) => void; onDelete?: () => void
}) {
  return (
    <div className="flex flex-row items-center justify-between py-2.5 border-t border-gray-50 first:border-t-0 gap-2 sm:gap-4 overflow-hidden">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {onLabelChange ? (
            <input 
              type="text" 
              value={label} 
              onChange={e => onLabelChange(e.target.value)}
              placeholder="Expense name"
              className="text-sm text-gray-900 truncate font-semibold bg-transparent border-none p-0 focus:ring-0 w-32 md:w-48 placeholder:text-gray-300"
            />
          ) : (
            <div className="text-sm text-gray-700 truncate font-medium">{label}</div>
          )}
          {onWalletChange && <WalletSelector value={wallet} onChange={onWalletChange} />}
        </div>
        {sublabel && <div className="text-xs text-gray-400">{sublabel}</div>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-sm text-gray-400 font-bold">₱</span>
        <input
          type="number"
          value={value || ''}
          min={0}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 text-right px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white text-gray-900 font-bold placeholder:text-gray-400"
        />
        {onDelete && (
          <button onClick={onDelete} className="p-1 px-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={13} />
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
    <div>
      {filtered.map(e => (
        <div key={e.id} className="flex flex-col gap-2 py-3 border-t border-gray-50 first:border-t-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Expense name"
              value={e.name}
              onChange={ev => update(e.id, 'name', ev.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 font-semibold placeholder:text-gray-400"
            />
            <button onClick={() => remove(e.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 pl-1">
            <WalletSelector value={e.wallet} onChange={v => update(e.id, 'wallet', v)} />
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400 font-bold">₱</span>
              <input
                type="number"
                placeholder="0"
                value={e.amount || ''}
                min={0}
                onChange={ev => update(e.id, 'amount', parseFloat(ev.target.value) || 0)}
                className="w-24 text-right px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 font-semibold placeholder:text-gray-400 shadow-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
      >
        <Plus size={14} /> Add expense
      </button>
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
        <div key={e.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl relative group">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Month/Label</label>
              <input
                type="text"
                placeholder="e.g. April Bonus"
                value={e.month}
                onChange={ev => update(e.id, 'month', ev.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 font-semibold placeholder:text-gray-400 shadow-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">15th Cutoff</label>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                  <span className="text-xs text-gray-400 font-bold">₱</span>
                  <input
                    type="number"
                    value={e.cutoff15 || ''}
                    onChange={ev => update(e.id, 'cutoff15', parseFloat(ev.target.value) || 0)}
                    className="w-full text-right text-sm font-semibold text-gray-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">30th Cutoff</label>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                  <span className="text-xs text-gray-400 font-bold">₱</span>
                  <input
                    type="number"
                    value={e.cutoff30 || ''}
                    onChange={ev => update(e.id, 'cutoff30', parseFloat(ev.target.value) || 0)}
                    className="w-full text-right text-sm font-semibold text-gray-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => remove(e.id)} 
            className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-red-100 text-red-500 rounded-full shadow-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-all scale-100 group-hover:scale-110"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-blue-600 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl hover:bg-blue-50 transition-all active:scale-[0.98]"
      >
        <Plus size={16} /> Add month item
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
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
      >
        <Plus size={14} /> {addButtonLabel}
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
    <div className="space-y-6 text-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold text-gray-700 mb-3">Allowance basics</div>
          <div className="space-y-1">
            <FieldRow label="Daily Allowance" value={config.dailyAllowance}
              onChange={v => onUpdate({ ...config, dailyAllowance: v })} />
            <FieldRow label="School days/week" value={config.schoolDaysPerWeek}
              onChange={v => onUpdate({ ...config, schoolDaysPerWeek: v })} />
          </div>
        </Card>
        
        <Card>
          <div className="text-sm font-semibold text-gray-700 mb-3 text-indigo-600">Savings Target</div>
          <div className="space-y-1">
            <FieldRow label="Goal Amount" value={config.savingsGoal || 0}
              onChange={v => onUpdate({ ...config, savingsGoal: v })} />
            <div className="flex items-center justify-between py-2.5 border-t border-gray-50 gap-4">
              <div className="text-sm text-gray-700">Split</div>
              <div className="flex items-center gap-2">
                <input
                  type="range" min={10} max={95} step={5}
                  value={config.savingsSplit || 70}
                  onChange={e => onUpdate({ ...config, savingsSplit: Number(e.target.value) })}
                  className="w-16 accent-indigo-500"
                />
                <span className="text-sm font-black text-indigo-600 w-10 text-right">{config.savingsSplit || 70}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold text-gray-700 mb-3 text-emerald-600">Daily school costs</div>
          <DynamicRecordList 
            items={config.baseDailyExpenses || {}}
            wallets={config.expenseWallets}
            onUpdate={items => onUpdate({ ...config, baseDailyExpenses: items })}
            syncWallet={syncWallet}
            addButtonLabel="Add cost"
          />
        </Card>
        <Card>
          <div className="text-sm font-semibold text-gray-700 mb-3 text-blue-600">Weekly Misc. costs</div>
          <DynamicRecordList 
            items={config.weeklySchoolExtra || {}}
            wallets={config.expenseWallets}
            onUpdate={items => onUpdate({ ...config, weeklySchoolExtra: items })}
            syncWallet={syncWallet}
            addButtonLabel="Add cost"
          />
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold text-gray-700 mb-3 text-violet-600">One-time student costs (Custom)</div>
        <CustomExpenseList
          items={config.customExpenses || []}
          onUpdate={items => onUpdate({ ...config, customExpenses: items })}
          cutoff="15" type="base"
        />
      </Card>
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
    
    // Also sync in custom items if name matches
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
    <div className="space-y-6">
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('worker')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'worker' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase size={16} />
          Worker
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <GraduationCap size={16} />
          Student
        </button>
      </div>

      {activeTab === 'worker' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-sm font-semibold text-gray-700 mb-3">15th cutoff income</div>
              <FieldRow label="Amount" value={settings.cutoff15.income} 
                onChange={v => onUpdate({ ...settings, cutoff15: { ...settings.cutoff15, income: v } })} />
            </Card>
            <Card>
              <div className="text-sm font-semibold text-gray-700 mb-3">30th cutoff income</div>
              <FieldRow label="Amount" value={settings.cutoff30.income}
                onChange={v => onUpdate({ ...settings, cutoff30: { ...settings.cutoff30, income: v } })} />
            </Card>
            <Card>
              <div className="text-sm font-semibold text-gray-700 mb-3 text-blue-600">Savings Parameters</div>
              <FieldRow label="Goal Target" value={settings.savingsGoal}
                onChange={v => onUpdate({ ...settings, savingsGoal: v })} />
              <div className="flex items-center justify-between py-2.5 border-t border-gray-50 gap-4">
                <div className="text-sm text-gray-700">Split</div>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={10} max={95} step={5}
                    value={settings.savingsSplit}
                    onChange={e => onUpdate({ ...settings, savingsSplit: Number(e.target.value) })}
                    className="w-20 accent-blue-500"
                  />
                  <span className="text-sm font-semibold text-blue-600 w-10 text-right">{settings.savingsSplit}%</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <SectionTitle>Additional Payments</SectionTitle>
            <Card>
               <AdditionalPaymentList
                items={settings.additionalPayments}
                onUpdate={items => onUpdate({ ...settings, additionalPayments: items })}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <SectionTitle>15th Cutoff</SectionTitle>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-gray-800">Base Expenses</div>
                  <button onClick={() => set15Base('New Expense', 0)} className="p-1 px-1.5 bg-blue-50 text-blue-600 rounded-lg"><Plus size={14} /></button>
                </div>
                {Object.entries(settings.cutoff15.baseExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} 
                    wallet={settings.cutoff15.expenseWallets?.[k]}
                    onWalletChange={w => syncWallet(k, w)}
                    onLabelChange={newK => handleKeyChange('15', 'base', k, newK)}
                    onDelete={() => handleRemoval('15', 'base', k)}
                    onChange={val => set15Base(k, val)} />
                ))}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <CustomExpenseList items={settings.cutoff15.customExpenses} onUpdate={setCustom15} cutoff="15" type="base" />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-amber-600">Heavy Extras</div>
                  <button onClick={() => set15Heavy('Heavy Item', 0)} className="p-1 px-1.5 bg-amber-50 text-amber-600 rounded-lg"><Plus size={14} /></button>
                </div>
                {Object.entries(settings.cutoff15.heavyExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} 
                    wallet={settings.cutoff15.expenseWallets?.[k]}
                    onWalletChange={w => syncWallet(k, w)}
                    onLabelChange={newK => handleKeyChange('15', 'heavy', k, newK)}
                    onDelete={() => handleRemoval('15', 'heavy', k)}
                    onChange={val => set15Heavy(k, val)} />
                ))}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <CustomExpenseList items={settings.cutoff15.customExpenses} onUpdate={setCustom15} cutoff="15" type="heavy" />
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <SectionTitle>30th Cutoff</SectionTitle>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-gray-800">Base Expenses</div>
                  <button onClick={() => set30Base('New Expense', 0)} className="p-1 px-1.5 bg-blue-50 text-blue-600 rounded-lg"><Plus size={14} /></button>
                </div>
                {Object.entries(settings.cutoff30.baseExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} 
                    wallet={settings.cutoff30.expenseWallets?.[k]}
                    onWalletChange={w => syncWallet(k, w)}
                    onLabelChange={newK => handleKeyChange('30', 'base', k, newK)}
                    onDelete={() => handleRemoval('30', 'base', k)}
                    onChange={val => set30Base(k, val)} />
                ))}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <CustomExpenseList items={settings.cutoff30.customExpenses} onUpdate={setCustom30} cutoff="30" type="base" />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-amber-600">Heavy Extras</div>
                  <button onClick={() => set30Heavy('Heavy Item', 0)} className="p-1 px-1.5 bg-amber-50 text-amber-600 rounded-lg"><Plus size={14} /></button>
                </div>
                {Object.entries(settings.cutoff30.heavyExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} 
                    wallet={settings.cutoff30.expenseWallets?.[k]}
                    onWalletChange={w => syncWallet(k, w)}
                    onLabelChange={newK => handleKeyChange('30', 'heavy', k, newK)}
                    onDelete={() => handleRemoval('30', 'heavy', k)}
                    onChange={val => set30Heavy(k, val)} />
                ))}
                <div className="mt-4 pt-4 border-t border-gray-100">
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
