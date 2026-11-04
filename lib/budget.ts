import { ExpenseTransaction, MonthlyBudgetLimit } from './types'

const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function getMonday(date: Date): Date {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (monday.getDay() + 6) % 7
  monday.setDate(monday.getDate() - offset)
  return monday
}

export function getWeekRange(mondayISO: string) {
  const start = new Date(`${mondayISO}T12:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return { start: localDate(start), end: localDate(end) }
}

export function getWeeksInMonth(year: number, monthIndex: number): string[] {
  const first = new Date(year, monthIndex, 1)
  const last = new Date(year, monthIndex + 1, 0)
  const mondays: string[] = []
  const cursor = getMonday(first)
  while (cursor <= last) {
    mondays.push(localDate(cursor))
    cursor.setDate(cursor.getDate() + 7)
  }
  return mondays
}

function expenseCategoryAmounts(transactions: ExpenseTransaction[], monthKey: string) {
  const amounts: Record<string, number> = {}
  transactions.filter(transaction => transaction.date.startsWith(monthKey) && transaction.budgetMode !== 'student' && ['expense', 'adjustment'].includes(transaction.type || 'expense')).forEach(transaction => {
    const parts = transaction.splits?.length
      ? transaction.splits
      : [{ category: transaction.category, amount: transaction.amount }]
    parts.forEach(part => { amounts[part.category] = (amounts[part.category] || 0) + part.amount })
  })
  return amounts
}

export function getMonthlyLimitSummary(
  transactions: ExpenseTransaction[],
  limits: Record<string, MonthlyBudgetLimit>,
  monthKey: string
) {
  const [year, month] = monthKey.split('-').map(Number)
  const priorDate = new Date(year, month - 2, 1)
  const priorKey = `${priorDate.getFullYear()}-${String(priorDate.getMonth() + 1).padStart(2, '0')}`
  const priorSpent = expenseCategoryAmounts(transactions, priorKey)
  const spent = expenseCategoryAmounts(transactions, monthKey)
  return Object.entries(limits).map(([category, config]) => {
    const carryover = config.rollover ? Math.max(0, config.amount - (priorSpent[category] || 0)) : 0
    const available = config.amount + carryover
    const used = spent[category] || 0
    return { category, limit: config.amount, carryover, available, spent: used, remaining: available - used, percent: available > 0 ? Math.round(used / available * 100) : 0 }
  }).sort((a, b) => b.percent - a.percent)
}

export function getAccountBalances(accounts: { id: string; startingBalance: number }[], transactions: ExpenseTransaction[]) {
  return accounts.map(account => ({
    account,
    balance: transactions.reduce((balance, transaction) => {
      const amount = Number(transaction.amount) || 0
      const kind = transaction.type || 'expense'
      if (transaction.accountId === account.id) {
        if (kind === 'income') return balance + amount
        return balance - amount
      }
      if (kind === 'transfer' && transaction.toAccountId === account.id) return balance + amount
      return balance
    }, account.startingBalance),
  }))
}
