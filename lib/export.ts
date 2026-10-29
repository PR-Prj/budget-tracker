import { HistoryEntry } from './types'

export function exportToCSV(history: HistoryEntry[]) {
  if (history.length === 0) return

  const rows: string[][] = [
    ['Month', 'Type', 'Cutoff', 'Item', 'Category', 'Planned', 'Actual', 'Variance', 'Wallet'],
  ]

  history.forEach(entry => {
    const type = entry.monthType ?? '-'

    if (entry.cutoff15) {
      const cutoff = entry.cutoff15
      cutoff.expenses.forEach(expense => {
        const actual = expense.actualAmount ?? expense.amount
        rows.push([entry.label, type, '15th', expense.name, expense.category, String(expense.amount), String(actual), String(expense.amount - actual), expense.wallet || '-'])
      })
      rows.push([entry.label, type, '15th SUMMARY', '-', '-', String(cutoff.totalExpenses), String(cutoff.totalActualExpenses ?? cutoff.totalExpenses), String(cutoff.variance ?? 0), '-'])
      rows.push([entry.label, type, '15th TOTALS', 'Income', '-', String(cutoff.income), String(cutoff.actualIncome ?? cutoff.income), 'Savings', String(cutoff.savings)])
    }

    if (entry.cutoff30) {
      const cutoff = entry.cutoff30
      cutoff.expenses.forEach(expense => {
        const actual = expense.actualAmount ?? expense.amount
        rows.push([entry.label, type, '30th', expense.name, expense.category, String(expense.amount), String(actual), String(expense.amount - actual), expense.wallet || '-'])
      })
      rows.push([entry.label, type, '30th SUMMARY', '-', '-', String(cutoff.totalExpenses), String(cutoff.totalActualExpenses ?? cutoff.totalExpenses), String(cutoff.variance ?? 0), '-'])
      rows.push([entry.label, type, '30th TOTALS', 'Income', '-', String(cutoff.income), String(cutoff.actualIncome ?? cutoff.income), 'Savings', String(cutoff.savings)])
    }

    if (entry.studentData) {
      const student = entry.studentData
      student.dailyExpenses.forEach(expense => {
        const actual = expense.actualAmount ?? 0
        rows.push([entry.label, 'Student', 'Daily', expense.name, 'daily', String(expense.amount), String(actual), String(expense.amount - actual), expense.wallet || '-'])
      })
      student.weeklyExtras.forEach(expense => {
        const actual = expense.actualAmount ?? 0
        rows.push([entry.label, 'Student', 'Weekly', expense.name, 'weekly', String(expense.amount), String(actual), String(expense.amount - actual), expense.wallet || '-'])
      })
      const plannedExpenses = student.dailyExpenses.reduce((sum, expense) => sum + expense.amount * student.schoolDaysPerWeek, 0)
        + student.weeklyExtras.reduce((sum, expense) => sum + expense.amount, 0)
      const actualExpenses = student.dailyExpenses.reduce((sum, expense) => sum + (expense.actualAmount ?? 0) * student.schoolDaysPerWeek, 0)
        + student.weeklyExtras.reduce((sum, expense) => sum + (expense.actualAmount ?? 0), 0)
      rows.push([entry.label, 'Student', 'WEEKLY SUMMARY', '-', '-', String(plannedExpenses), String(actualExpenses), String(plannedExpenses - actualExpenses), '-'])
      rows.push([entry.label, 'Student', 'WEEKLY TOTALS', 'Allowance', '-', String(student.dailyAllowance * student.schoolDaysPerWeek), String(student.actualDailyAllowance * student.schoolDaysPerWeek), 'Savings', String(student.savings)])
    }

    rows.push(['-', '-', '-', '-', '-', '-', '-', '-', '-'])
  })

  const csvContent = rows
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `budget_history_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
