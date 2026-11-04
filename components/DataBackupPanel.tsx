'use client'
import { ChangeEvent, useRef, useState } from 'react'
import { Download, FileUp, ShieldCheck } from 'lucide-react'
import { createBackup, parseBackup } from '@/lib/backup'
import { ExpenseTransaction, HistoryEntry, Settings } from '@/lib/types'

interface Props {
  settings: Settings
  transactions: ExpenseTransaction[]
  history: HistoryEntry[]
  onRestore: (backup: ReturnType<typeof createBackup>) => void
}

export default function DataBackupPanel({ settings, transactions, history, onRestore }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(createBackup(settings, transactions, history), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `budget-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed = parseBackup(JSON.parse(await file.text()))
      if (!parsed) { setMessage('Hindi valid na Budget Tracker backup file.'); return }
      if (!window.confirm(`Papaltan ng backup ang kasalukuyang data (${transactions.length} transactions, ${history.length} history entries). Mag-download muna ng backup kung kailangan.`)) return
      onRestore(parsed)
      setMessage(`Na-restore: ${parsed.transactions.length} transactions at ${parsed.history.length} history entries.`)
    } catch {
      setMessage('Hindi mabasa ang backup file. Siguraduhing valid JSON ito.')
    }
  }

  return <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-4"><div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><ShieldCheck size={18} /></div><div><h2 className="font-bold text-slate-900">Backup & restore</h2><p className="text-xs text-slate-500">Save or restore settings, accounts, transactions, and history in one file.</p></div></div>
    <div className="flex flex-wrap gap-2"><button type="button" onClick={downloadBackup} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold"><Download size={15} />Download full backup</button><button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"><FileUp size={15} />Restore backup</button><input ref={inputRef} type="file" accept=".json,application/json" onChange={restoreBackup} className="hidden" /></div>
    {message && <p role="status" className="mt-3 text-xs font-semibold text-indigo-700">{message}</p>}
  </section>
}
