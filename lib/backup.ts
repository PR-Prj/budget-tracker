import { ExpenseTransaction, HistoryEntry, Settings } from './types'

export interface BudgetBackup {
  format: 'budget-tracker-backup'
  version: 1
  exportedAt: string
  settings: Settings
  transactions: ExpenseTransaction[]
  history: HistoryEntry[]
}

export function createBackup(settings: Settings, transactions: ExpenseTransaction[], history: HistoryEntry[]): BudgetBackup {
  return { format: 'budget-tracker-backup', version: 1, exportedAt: new Date().toISOString(), settings, transactions, history }
}

export function parseBackup(value: unknown): BudgetBackup | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Partial<BudgetBackup>
  if (data.format !== 'budget-tracker-backup' || data.version !== 1 || !data.settings || !Array.isArray(data.transactions) || !Array.isArray(data.history)) return null
  return data as BudgetBackup
}
