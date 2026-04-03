import { HistoryEntry } from './types'

export function exportToCSV(history: HistoryEntry[]) {
  if (history.length === 0) return

  const rows = [
    ['Month', 'Type', 'Cutoff', 'Item', 'Category', 'Planned', 'Actual', 'Variance', 'Wallet']
  ]

  history.forEach(entry => {
    // 15th Cutoff
    entry.cutoff15.expenses.forEach(e => {
        rows.push([
            entry.label,
            entry.monthType,
            '15th',
            e.name,
            e.category,
            e.amount.toString(),
            (e.actualAmount ?? e.amount).toString(),
            (e.amount - (e.actualAmount ?? e.amount)).toString(),
            e.wallet || '-'
        ])
    })
    // Summary row for 15th
    rows.push([
        entry.label, 
        entry.monthType, 
        '15th SUMMARY', 
        '-', 
        '-', 
        entry.cutoff15.totalExpenses.toString(),
        (entry.cutoff15.totalActualExpenses || entry.cutoff15.totalExpenses).toString(),
        (entry.cutoff15.variance || 0).toString(),
        '-'
    ])
    rows.push([
        entry.label, 
        entry.monthType, 
        '15th TOTALS', 
        'Income', 
        '-', 
        entry.cutoff15.income.toString(),
        (entry.cutoff15.actualIncome ?? entry.cutoff15.income).toString(),
        'Savings',
        entry.cutoff15.savings.toString()
    ])

    // 30th Cutoff
    entry.cutoff30.expenses.forEach(e => {
        rows.push([
            entry.label,
            entry.monthType,
            '30th',
            e.name,
            e.category,
            e.amount.toString(),
            (e.actualAmount ?? e.amount).toString(),
            (e.amount - (e.actualAmount ?? e.amount)).toString(),
            e.wallet || '-'
        ])
    })
    // Summary row for 30th
    rows.push([
        entry.label, 
        entry.monthType, 
        '30th SUMMARY', 
        '-', 
        '-', 
        entry.cutoff30.totalExpenses.toString(),
        (entry.cutoff30.totalActualExpenses || entry.cutoff30.totalExpenses).toString(),
        (entry.cutoff30.variance || 0).toString(),
        '-'
    ])
    rows.push([
        entry.label, 
        entry.monthType, 
        '30th TOTALS', 
        'Income', 
        '-', 
        entry.cutoff30.income.toString(),
        (entry.cutoff30.actualIncome ?? entry.cutoff30.income).toString(),
        'Savings',
        entry.cutoff30.savings.toString()
    ])

    rows.push(['-', '-', '-', '-', '-', '-', '-', '-', '-']) // empty separator
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
}
