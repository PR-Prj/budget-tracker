'use client'
import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, FileUp, Pencil, Plus, Receipt, Split, Trash2, X } from 'lucide-react'
import { peso } from '@/lib/calc'
import { Account, ExpenseTransaction, TransactionSplit } from '@/lib/types'
import { transactionsFromCSV, transactionsToCSV } from '@/lib/transactionCsv'

interface Props {
  transactions: ExpenseTransaction[]
  accounts: Account[]
  budgetItems: { worker: string[]; student: string[] }
  goals: { id: string; name: string }[]
  onAdd: (transaction: ExpenseTransaction) => void
  onUpdate: (transaction: ExpenseTransaction) => void
  onRemove: (id: string) => void
}

const todayISO = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export default function TransactionsTab({ transactions, accounts, budgetItems, goals, onAdd, onUpdate, onRemove }: Props) {
  const [transactionType, setTransactionType] = useState<NonNullable<ExpenseTransaction['type']>>('expense')
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [category, setCategory] = useState('Food')
  const [budgetMode, setBudgetMode] = useState<'worker' | 'student'>('worker')
  const [budgetItem, setBudgetItem] = useState('')
  const [accountId, setAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [goalEffect, setGoalEffect] = useState<'contribution' | 'withdrawal'>('contribution')
  const [note, setNote] = useState('')
  const [incomeSource, setIncomeSource] = useState<NonNullable<ExpenseTransaction['incomeSource']>>('salary')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [importMessage, setImportMessage] = useState('')
  const [isSplit, setIsSplit] = useState(false)
  const [splits, setSplits] = useState<TransactionSplit[]>([{ category: 'Food', amount: 0 }, { category: 'Other', amount: 0 }])
  const [selectedMonth, setSelectedMonth] = useState(todayISO().slice(0, 7))
  const activeBudgetItems = budgetItems[budgetMode]

  const monthTransactions = useMemo(() => transactions.filter(t => t.date.startsWith(selectedMonth)), [transactions, selectedMonth])
  const expenses = monthTransactions.filter(transaction => ['expense', 'adjustment'].includes(transaction.type || 'expense'))
  const incomeTotal = monthTransactions.filter(transaction => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0)
  const monthTotal = expenses.reduce((sum, transaction) => sum + transaction.amount, 0)
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    monthTransactions.filter(transaction => ['expense', 'adjustment'].includes(transaction.type || 'expense')).forEach(transaction => {
      if (transaction.splits?.length) transaction.splits.forEach(split => { totals[split.category] = (totals[split.category] || 0) + split.amount })
      else totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount
    })
    return Object.entries(totals).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total)
  }, [monthTransactions])

  function submit(e: FormEvent) {
    e.preventDefault()
    const splitItems = splits.filter(split => split.category.trim() && split.amount > 0)
    const value = isSplit && transactionType === 'expense' ? splitItems.reduce((sum, split) => sum + split.amount, 0) : Number(amount)
    if (!merchant.trim() || (transactionType === 'adjustment' ? value === 0 : value <= 0) || !date || (isSplit && transactionType === 'expense' && splitItems.length < 2)) return
    if (transactionType === 'transfer' && (!accountId || !toAccountId || accountId === toAccountId)) return
    const transaction: ExpenseTransaction = {
      id: editingId || `tx-${Date.now()}`,
      date,
      merchant: merchant.trim(),
      amount: value,
      category: transactionType === 'transfer' ? 'Transfer' : isSplit ? 'Split' : category,
      note: note.trim() || undefined,
      splits: isSplit && transactionType === 'expense' ? splitItems : undefined,
      type: transactionType,
      budgetMode: transactionType === 'transfer' ? undefined : budgetMode,
      accountId: accountId || undefined,
      toAccountId: transactionType === 'transfer' ? toAccountId : undefined,
      budgetItem: ['expense', 'adjustment'].includes(transactionType) && !isSplit ? budgetItem || undefined : undefined,
      goalId: transactionType === 'transfer' ? goalId || undefined : undefined,
      goalEffect: transactionType === 'transfer' && goalId ? goalEffect : undefined,
      incomeSource: transactionType === 'income' ? incomeSource : undefined,
      billId: editingId ? transactions.find(item => item.id === editingId)?.billId : undefined,
    }
    if (editingId) onUpdate(transaction)
    else onAdd(transaction)
    setMerchant('')
    setAmount('')
    setNote('')
    setToAccountId('')
    setGoalId('')
    setGoalEffect('contribution')
    setBudgetItem('')
    setIsSplit(false)
    setSplits([{ category: 'Food', amount: 0 }, { category: 'Other', amount: 0 }])
    setEditingId(null)
  }

  function startEdit(transaction: ExpenseTransaction) {
    setEditingId(transaction.id)
    setTransactionType(transaction.type || 'expense')
    setMerchant(transaction.merchant)
    setAmount(String(transaction.amount))
    setDate(transaction.date)
    setCategory(transaction.category)
    setBudgetMode(transaction.budgetMode || 'worker')
    setBudgetItem(transaction.budgetItem || '')
    setAccountId(transaction.accountId || '')
    setToAccountId(transaction.toAccountId || '')
    setGoalId(transaction.goalId || '')
    setGoalEffect(transaction.goalEffect || 'contribution')
    setNote(transaction.note || '')
    setIncomeSource(transaction.incomeSource || (transaction.budgetMode === 'student' ? 'allowance' : 'salary'))
    setIsSplit(Boolean(transaction.splits?.length))
    setSplits(transaction.splits?.length ? transaction.splits : [{ category: 'Food', amount: 0 }, { category: 'Other', amount: 0 }])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function downloadCSV() {
    const blob = new Blob([transactionsToCSV(transactions)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `budget_transactions_${todayISO()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importCSV(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const rows = transactionsFromCSV(await file.text())
    const usedIds = new Set(transactions.map(transaction => transaction.id))
    rows.forEach(transaction => {
      if (usedIds.has(transaction.id)) transaction.id = `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      usedIds.add(transaction.id)
      onAdd(transaction)
    })
    setImportMessage(`${rows.length} transaction${rows.length === 1 ? '' : 's'} imported.`)
  }

  function updateSplit(index: number, key: keyof TransactionSplit, value: string) {
    setSplits(current => current.map((split, i) => {
      if (i !== index) return split
      if (key === 'amount') return { ...split, amount: Number(value) || 0 }
      if (key === 'budgetItem') return { ...split, budgetItem: value || undefined }
      return { ...split, category: value }
    }))
  }

  const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-black text-slate-900">Transactions & monthly summary</h1><p className="mt-1 text-sm text-slate-500">Log expenses and see how spending is distributed by category.</p></div><div className="flex gap-2"><button type="button" onClick={downloadCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"><Download size={14} />Export CSV</button><label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold cursor-pointer"><FileUp size={14} />Import CSV<input type="file" accept=".csv,text/csv" onChange={importCSV} className="hidden" /></label></div></div>
      {importMessage && <div role="status" className="text-sm font-semibold text-emerald-700">{importMessage}</div>}

      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-rose-50 text-rose-500"><Receipt size={18} /></div><div><h2 className="font-bold text-slate-900">{editingId ? 'Edit transaction' : 'Add a transaction'}</h2><p className="text-xs text-slate-500">Link expenses to a planned budget item so the Dashboard actuals update automatically.</p></div></div>{editingId && <button type="button" onClick={() => setEditingId(null)} className="p-2 text-slate-400"><X size={16} /></button>}</div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select value={transactionType} onChange={e => { setTransactionType(e.target.value as NonNullable<ExpenseTransaction['type']>); setIsSplit(false) }} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option><option value="adjustment">Budget adjustment</option></select>
            <input value={merchant} onChange={e => setMerchant(e.target.value)} required placeholder="Merchant or description" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            {!isSplit && <input type="number" min={transactionType === 'adjustment' ? undefined : '0.01'} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Amount (₱)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />}
            {transactionType !== 'transfer' && !isSplit && <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />}
          </div>
          {transactionType !== 'transfer' && <select value={budgetMode} onChange={e => { const mode = e.target.value as 'worker' | 'student'; setBudgetMode(mode); setIncomeSource(mode === 'student' ? 'allowance' : 'salary'); setBudgetItem(''); setSplits(current => current.map(split => ({ ...split, budgetItem: undefined }))) }} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="worker">Main budget</option><option value="student">Student budget</option></select>}
          {transactionType === 'income' && <select value={incomeSource} onChange={e => setIncomeSource(e.target.value as NonNullable<ExpenseTransaction['incomeSource']>)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="allowance">Allowance</option><option value="scholarship">Scholarship</option><option value="part-time">Part-time work</option><option value="salary">Salary</option><option value="other">Other income</option></select>}
          {['expense', 'adjustment'].includes(transactionType) && !isSplit && <select value={budgetItem} onChange={e => setBudgetItem(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">Unplanned expense (not linked to a budget line)</option>{activeBudgetItems.map(item => <option key={item} value={item}>Counts toward: {item}</option>)}</select>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={accountId} required={transactionType === 'transfer' || accounts.length > 0} onChange={e => { setAccountId(e.target.value); if (e.target.value === toAccountId) setToAccountId('') }} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">{accounts.length ? 'Select account' : 'Add an account to track balances'}</option>{accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select>
            {transactionType === 'transfer' && <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} required className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">To account</option>{accounts.filter(account => account.id !== accountId).map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select>}
          </div>
          {transactionType === 'transfer' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><select value={goalId} onChange={e => setGoalId(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">No savings goal</option>{goals.map(goal => <option key={goal.id} value={goal.id}>{goal.name}</option>)}</select>{goalId && <select value={goalEffect} onChange={e => setGoalEffect(e.target.value as 'contribution' | 'withdrawal')} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="contribution">Add to goal</option><option value="withdrawal">Withdraw from goal</option></select>}</div>}
          {transactionType === 'transfer' && accounts.length < 2 && <p className="text-xs text-amber-600">Add at least two accounts before recording a transfer.</p>}
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          {transactionType === 'expense' && <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer"><input type="checkbox" checked={isSplit} onChange={e => setIsSplit(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary" /><Split size={15} /> Split this expense into categories</label>}
          {isSplit && <div className="space-y-2 p-4 rounded-2xl bg-slate-50">
            {splits.map((split, i) => <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-2">
              <input value={split.category} onChange={e => updateSplit(i, 'category', e.target.value)} placeholder="Category" className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              <input type="number" min="0" step="0.01" value={split.amount || ''} onChange={e => updateSplit(i, 'amount', e.target.value)} placeholder="Amount (₱)" className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              <select value={split.budgetItem || ''} onChange={e => updateSplit(i, 'budgetItem', e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"><option value="">Unplanned</option>{activeBudgetItems.map(item => <option key={item} value={item}>{item}</option>)}</select>
              {splits.length > 2 && <button type="button" onClick={() => setSplits(current => current.filter((_, index) => index !== i))} className="px-3 py-2 text-slate-400 hover:text-rose-500">Remove</button>}
            </div>)}
            <div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setSplits(current => [...current, { category: '', amount: 0 }])} className="text-xs font-bold text-primary">+ Add split</button><span className="text-xs font-bold text-slate-600">Total expense: {peso(splitTotal)}</span></div>
          </div>}
          <button disabled={transactionType === 'transfer' && accounts.length < 2} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 disabled:opacity-40"><Plus size={16} />{editingId ? 'Update' : 'Save'} {transactionType}</button>
        </form>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-3xl p-6 text-white"><label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Summary month<input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="block mt-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" /></label><div className="mt-6 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Recorded expenses</div><div className="mt-1 text-3xl font-black">{peso(monthTotal)}</div><div className="mt-2 text-xs text-slate-400">Income: <span className="font-bold text-emerald-300">{peso(incomeTotal)}</span> · {monthTransactions.length} transaction{monthTransactions.length === 1 ? '' : 's'}</div></div>
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><h2 className="font-bold text-slate-900 mb-3">Spending by category</h2>{categoryTotals.length === 0 ? <p className="py-12 text-center text-sm text-slate-400">No expenses recorded for this month.</p> : <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryTotals} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={value => `₱${value}`} /><Tooltip formatter={(value) => peso(Number(value))} /><Bar dataKey="total" name="Spent" fill="#f43f5e" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>}</div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><h2 className="font-bold text-slate-900 mb-3">Transactions in {selectedMonth}</h2>{monthTransactions.length === 0 ? <p className="py-6 text-center text-sm text-slate-400">No transactions for this month yet.</p> : <div className="divide-y divide-slate-100">{monthTransactions.slice().sort((a, b) => b.date.localeCompare(a.date)).map(transaction => { const kind = transaction.type || 'expense'; const source = accounts.find(account => account.id === transaction.accountId)?.name; const destination = accounts.find(account => account.id === transaction.toAccountId)?.name; const credit = kind === 'income' || (kind === 'adjustment' && transaction.amount < 0); const debit = kind === 'expense' || (kind === 'adjustment' && transaction.amount >= 0); return <div key={transaction.id} className="flex items-start gap-3 py-4"><div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${credit ? 'bg-emerald-50 text-emerald-600' : kind === 'transfer' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'}`}><Receipt size={16} /></div><div className="min-w-0 flex-1"><div className="font-bold text-sm text-slate-800">{transaction.merchant}</div><div className="text-xs text-slate-400">{transaction.date} · {kind === 'adjustment' ? 'budget adjustment' : kind}{kind !== 'transfer' ? ` · ${transaction.category}` : ''}{transaction.incomeSource ? ` · ${transaction.incomeSource}` : ''}{transaction.budgetItem ? ` · Budget: ${transaction.budgetItem}` : ''}{source ? ` · ${source}` : ''}{destination ? ` → ${destination}` : ''}{transaction.goalId ? ` · Goal ${goals.find(goal => goal.id === transaction.goalId)?.name || ''}` : ''}{transaction.note ? ` · ${transaction.note}` : ''}</div>{transaction.splits?.length ? <div className="text-[10px] text-slate-400 mt-1">{transaction.splits.map(s => `${s.category} ${peso(s.amount)}${s.budgetItem ? ` → ${s.budgetItem}` : ''}`).join(' · ')}</div> : null}</div><div className={`font-black text-sm ${credit ? 'text-emerald-600' : 'text-slate-800'}`}>{credit ? '+' : debit ? '−' : ''}{peso(Math.abs(transaction.amount))}</div><button onClick={() => startEdit(transaction)} aria-label={`Edit transaction ${transaction.merchant}`} className="p-2 text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"><Pencil size={15} /></button><button onClick={() => onRemove(transaction.id)} aria-label={`Delete transaction ${transaction.merchant}`} className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-lg"><Trash2 size={15} /></button></div>})}</div>}</section>
    </div>
  )
}
