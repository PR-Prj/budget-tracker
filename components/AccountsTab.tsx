'use client'
import { FormEvent, useMemo, useState } from 'react'
import { Account, ExpenseTransaction } from '@/lib/types'
import { peso } from '@/lib/calc'
import { Landmark, Plus, Trash2, Wallet } from 'lucide-react'

interface Props {
  accounts: Account[]
  transactions: ExpenseTransaction[]
  onUpdate: (accounts: Account[]) => void
}

const ACCOUNT_TYPES: Account['type'][] = ['bank', 'e-wallet', 'cash', 'other']

function getBalance(account: Account, transactions: ExpenseTransaction[]) {
  return transactions.reduce((balance, transaction) => {
    const amount = Number(transaction.amount) || 0
    const kind = transaction.type || 'expense'
    if (transaction.accountId === account.id) {
      if (kind === 'income') return balance + amount
      return balance - amount
    }
    if (kind === 'transfer' && transaction.toAccountId === account.id) return balance + amount
    return balance
  }, account.startingBalance)
}

export default function AccountsTab({ accounts, transactions, onUpdate }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState<Account['type']>('bank')
  const [startingBalance, setStartingBalance] = useState('')

  const balances = useMemo(() => accounts.map(account => ({ account, balance: getBalance(account, transactions) })), [accounts, transactions])
  const totalBalance = balances.reduce((sum, item) => sum + item.balance, 0)

  function addAccount(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onUpdate([...accounts, {
      id: `account-${Date.now()}`,
      name: name.trim(),
      type,
      startingBalance: Number(startingBalance) || 0,
    }])
    setName('')
    setStartingBalance('')
  }

  function updateAccount(id: string, changes: Partial<Account>) {
    onUpdate(accounts.map(account => account.id === id ? { ...account, ...changes } : account))
  }

  function removeAccount(account: Account) {
    const linkedCount = transactions.filter(transaction => transaction.accountId === account.id || transaction.toAccountId === account.id).length
    const detail = linkedCount > 0 ? ` ${linkedCount} linked transaction(s) will keep their records but lose this account link.` : ''
    if (!window.confirm(`Remove ${account.name}?${detail}`)) return
    onUpdate(accounts.filter(item => item.id !== account.id))
  }

  return (
    <div className="space-y-8 pb-12">
      <div><h1 className="text-2xl font-black text-slate-900">Accounts</h1><p className="mt-1 text-sm text-slate-500">Track balances across your banks, e-wallets, and cash accounts.</p></div>

      <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-white/10 text-primary"><Wallet size={19} /></div><div><div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total tracked balance</div><div className="text-3xl font-black mt-1">{peso(totalBalance)}</div></div></div>
        <p className="text-xs text-slate-400 mt-4">Calculated from each starting balance plus recorded income, expenses, and transfers.</p>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5"><div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Landmark size={18} /></div><div><h2 className="font-bold text-slate-900">Add an account</h2><p className="text-xs text-slate-500">Use the balance you have today as its starting balance.</p></div></div>
        <form onSubmit={addAccount} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. BPI Savings, Maya" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <select value={type} onChange={e => setType(e.target.value as Account['type'])} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">{ACCOUNT_TYPES.map(item => <option key={item} value={item}>{item === 'e-wallet' ? 'E-wallet' : item[0].toUpperCase() + item.slice(1)}</option>)}</select>
          <input type="number" min="0" step="0.01" value={startingBalance} onChange={e => setStartingBalance(e.target.value)} placeholder="Starting balance (₱)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700"><Plus size={16} /> Add account</button>
        </form>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {balances.length === 0 ? <div className="md:col-span-2 py-14 text-center bg-white border border-dashed border-slate-200 rounded-3xl"><Wallet size={28} className="mx-auto text-slate-300 mb-3" /><p className="text-sm text-slate-500">Add your first bank or e-wallet to start tracking.</p></div> : balances.map(({ account, balance }) => (
          <article key={account.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-start gap-3"><div className="p-2.5 rounded-xl bg-slate-50 text-slate-500"><Landmark size={18} /></div><div className="flex-1 min-w-0"><input aria-label="Account name" value={account.name} onChange={e => updateAccount(account.id, { name: e.target.value })} className="w-full text-base font-bold text-slate-900 bg-transparent border-0 p-0 focus:ring-0" /><p className="text-xs text-slate-400 mt-1 capitalize">{account.type}</p></div><button onClick={() => removeAccount(account)} aria-label={`Remove ${account.name}`} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={15} /></button></div>
            <div className="mt-6"><div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Current balance</div><div className={`text-2xl font-black mt-1 ${balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{peso(balance)}</div></div>
            <label className="block mt-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Starting balance<input type="number" step="0.01" value={account.startingBalance} onChange={e => updateAccount(account.id, { startingBalance: Number(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700" /></label>
          </article>
        ))}
      </section>
      <p className="text-xs text-slate-400 text-center">Balances are manual estimates based on transactions you record. Bank credentials are not requested or connected.</p>
    </div>
  )
}
