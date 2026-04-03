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

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-200 rounded-2xl p-5 ${className}`}>{children}</div>
}

function FieldRow({
  label, sublabel, value, onChange
}: {
  label: string; sublabel?: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-t border-gray-50 first:border-t-0 gap-4">
      <div>
        <div className="text-sm text-gray-700">{label}</div>
        {sublabel && <div className="text-xs text-gray-400">{sublabel}</div>}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-400">₱</span>
        <input
          type="number"
          value={value || ''}
          min={0}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-28 text-right px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white text-gray-900 font-bold placeholder:text-gray-400"
        />
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
        <div key={e.id} className="flex items-center gap-2 py-2 border-t border-gray-50 first:border-t-0">
          <input
            type="text"
            placeholder="Expense name"
            value={e.name}
            onChange={ev => update(e.id, 'name', ev.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 font-bold placeholder:text-gray-400"
          />
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-400">₱</span>
            <input
              type="number"
              placeholder="0"
              value={e.amount || ''}
              min={0}
              onChange={ev => update(e.id, 'amount', parseFloat(ev.target.value) || 0)}
              className="w-24 text-right px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 font-bold placeholder:text-gray-400"
            />
          </div>
          <button onClick={() => remove(e.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
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
    <div>
      {items.map(e => (
        <div key={e.id} className="grid grid-cols-12 gap-2 py-2 border-t border-gray-50 first:border-t-0 items-center">
          <div className="col-span-4">
             <input
              type="text"
              placeholder="e.g. April"
              value={e.month}
              onChange={ev => update(e.id, 'month', ev.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 font-bold placeholder:text-gray-400"
            />
          </div>
          <div className="col-span-3 flex items-center gap-1">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">15th</span>
            <div className="flex-1 flex items-center gap-1 border border-gray-200 rounded-lg bg-gray-50 px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 focus-within:bg-white transition-all">
              <span className="text-xs text-gray-400">₱</span>
              <input
                type="number"
                placeholder="0"
                value={e.cutoff15 || ''}
                min={0}
                onChange={ev => update(e.id, 'cutoff15', parseFloat(ev.target.value) || 0)}
                className="w-full text-right text-sm bg-transparent focus:outline-none text-gray-900 font-bold placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="col-span-3 flex items-center gap-1">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">30th</span>
            <div className="flex-1 flex items-center gap-1 border border-gray-200 rounded-lg bg-gray-50 px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 focus-within:bg-white transition-all">
              <span className="text-xs text-gray-400">₱</span>
              <input
                type="number"
                placeholder="0"
                value={e.cutoff30 || ''}
                min={0}
                onChange={ev => update(e.id, 'cutoff30', parseFloat(ev.target.value) || 0)}
                className="w-full text-right text-sm bg-transparent focus:outline-none text-gray-900 font-bold placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="col-span-2 flex justify-end">
            <button onClick={() => remove(e.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
      >
        <Plus size={14} /> Add month with additional payments
      </button>
    </div>
  )
}
function DynamicRecordList({
  items, onUpdate, addButtonLabel
}: {
  items: Record<string, number>
  onUpdate: (items: Record<string, number>) => void
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
  }
  function update(key: string, val: number) {
    onUpdate({ ...items, [key]: val })
  }

  return (
    <div>
      {Object.entries(items).map(([k, v]) => (
        <div key={k} className="flex items-center gap-2 py-1.5 border-t border-gray-50 first:border-t-0">
          <div className="flex-1 text-sm text-gray-700 truncate">{k}</div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">₱</span>
            <input
              type="number"
              value={v || ''}
              min={0}
              onChange={e => update(k, parseFloat(e.target.value) || 0)}
              className="w-20 text-right px-2 py-1 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all text-gray-900 font-bold placeholder:text-gray-400"
            />
          </div>
          <button onClick={() => remove(k)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
      >
        <Plus size={12} /> {addButtonLabel}
      </button>
    </div>
  )
}

function StudentSettingsEditor({
  config, onUpdate
}: {
  config: StudentConfig
  onUpdate: (c: StudentConfig) => void
}) {
  function setBase(items: Record<string, number>) {
    onUpdate({ ...config, baseDailyExpenses: items })
  }
  function setExtra(items: Record<string, number>) {
    onUpdate({ ...config, weeklySchoolExtra: items })
  }
  function setCustom(items: CustomExpense[]) {
    onUpdate({ ...config, customExpenses: items })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm font-semibold text-gray-700 mb-3">Allowance basics</div>
          <FieldRow label="Daily Allowance" value={config.dailyAllowance}
            onChange={v => onUpdate({ ...config, dailyAllowance: v })} />
          <FieldRow label="School days/week" value={config.schoolDaysPerWeek}
            onChange={v => onUpdate({ ...config, schoolDaysPerWeek: v })} />
        </Card>
        
        <Card>
          <div className="text-sm font-semibold text-gray-700 mb-3 text-indigo-600">Savings & Goal</div>
          <FieldRow label="Savings Target" value={config.savingsGoal || 0}
            onChange={v => onUpdate({ ...config, savingsGoal: v })} />
          <div className="flex items-center justify-between py-2.5 border-t border-gray-50 gap-4">
            <div className="text-sm text-gray-700">Savings split</div>
            <div className="flex items-center gap-2">
              <input
                type="range" min={10} max={90} step={5}
                value={config.savingsSplit || 70}
                onChange={e => onUpdate({ ...config, savingsSplit: Number(e.target.value) })}
                className="w-16 accent-indigo-500"
              />
              <span className="text-sm font-medium text-indigo-600 w-10 text-right">{config.savingsSplit || 70}%</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {config.savingsSplit || 70}% savings, {100 - (config.savingsSplit || 70)}% buffer from leftover
          </p>
        </Card>

        <Card>
          <div className="text-sm font-semibold text-gray-700 mb-3">Daily school costs</div>
          <DynamicRecordList 
            items={config.baseDailyExpenses || {}}
            onUpdate={setBase}
            addButtonLabel="Add daily cost"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold text-gray-700 mb-3">Weekly Misc. costs</div>
          <DynamicRecordList 
            items={config.weeklySchoolExtra || {}}
            onUpdate={setExtra}
            addButtonLabel="Add weekly cost"
          />
        </Card>
        
        <Card>
          <div className="text-sm font-semibold text-gray-700 mb-3">Extra one-time costs</div>
          <CustomExpenseList
            items={config.customExpenses || []}
            onUpdate={setCustom}
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

  return (
    <div className="space-y-6">
      {/* Settings Type Toggle */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('worker')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'worker' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase size={16} />
          Worker Budget
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <GraduationCap size={16} />
          Student Budget
        </button>
      </div>

      {activeTab === 'worker' ? (
        <>
          {/* Income & Goal */}
          <div>
            <SectionTitle>Income & savings goal</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <div className="text-sm font-semibold text-gray-700 mb-3">Savings goal</div>
                <FieldRow label="Target" value={settings.savingsGoal}
                  onChange={v => onUpdate({ ...settings, savingsGoal: v })} />
                <div className="flex items-center justify-between py-2.5 border-t border-gray-50 gap-4">
                  <div className="text-sm text-gray-700">Savings split</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={10} max={90} step={5}
                      value={settings.savingsSplit}
                      onChange={e => onUpdate({ ...settings, savingsSplit: Number(e.target.value) })}
                      className="w-20 accent-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-600 w-12 text-right">{settings.savingsSplit}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {settings.savingsSplit}% savings, {100 - settings.savingsSplit}% buffer from remaining
                </p>
              </Card>
            </div>
          </div>

          {/* Additional payments */}
          <div>
            <SectionTitle>Additional payments (occasional)</SectionTitle>
            <Card>
              <div className="flex items-center gap-2 mb-3 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                <Info size={12} />
                These are deductions from both cutoffs in the selected special month.
              </div>
              <AdditionalPaymentList
                items={settings.additionalPayments}
                onUpdate={items => onUpdate({ ...settings, additionalPayments: items })}
              />
            </Card>
          </div>

          {/* 15th cutoff expenses */}
          <div>
            <SectionTitle>15th cutoff expenses</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <div className="text-sm font-semibold text-gray-700 mb-3">Base expenses <span className="text-xs font-normal text-gray-400">(every month)</span></div>
                {Object.entries(settings.cutoff15.baseExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} onChange={val => set15Base(k, val)} />
                ))}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 mb-2">Custom base expenses</div>
                  <CustomExpenseList
                    items={settings.cutoff15.customExpenses}
                    onUpdate={setCustom15}
                    cutoff="15" type="base"
                  />
                </div>
              </Card>
              <Card>
                <div className="text-sm font-semibold text-gray-700 mb-3">Heavy month expenses <span className="text-xs font-normal text-amber-500">(heavy only)</span></div>
                {Object.entries(settings.cutoff15.heavyExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} onChange={val => set15Heavy(k, val)} />
                ))}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 mb-2">Custom heavy expenses</div>
                  <CustomExpenseList
                    items={settings.cutoff15.customExpenses}
                    onUpdate={setCustom15}
                    cutoff="15" type="heavy"
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* 30th cutoff expenses */}
          <div>
            <SectionTitle>30th cutoff expenses</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <div className="text-sm font-semibold text-gray-700 mb-3">Base expenses <span className="text-xs font-normal text-gray-400">(every month)</span></div>
                {Object.entries(settings.cutoff30.baseExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} onChange={val => set30Base(k, val)} />
                ))}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 mb-2">Custom base expenses</div>
                  <CustomExpenseList
                    items={settings.cutoff30.customExpenses}
                    onUpdate={setCustom30}
                    cutoff="30" type="base"
                  />
                </div>
              </Card>
              <Card>
                <div className="text-sm font-semibold text-gray-700 mb-3">Heavy month expenses <span className="text-xs font-normal text-amber-500">(heavy only)</span></div>
                {Object.entries(settings.cutoff30.heavyExpenses).map(([k, v]) => (
                  <FieldRow key={k} label={k} value={v} onChange={val => set30Heavy(k, val)} />
                ))}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 mb-2">Custom heavy expenses</div>
                  <CustomExpenseList
                    items={settings.cutoff30.customExpenses}
                    onUpdate={setCustom30}
                    cutoff="30" type="heavy"
                  />
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <StudentSettingsEditor
          config={settings.studentConfig}
          onUpdate={c => onUpdate({ ...settings, studentConfig: c })}
        />
      )}
    </div>
  )
}
