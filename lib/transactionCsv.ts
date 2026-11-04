import { ExpenseTransaction } from './types'

const columns = ['id', 'date', 'type', 'merchant', 'amount', 'category', 'budgetMode', 'accountId', 'toAccountId', 'budgetItem', 'incomeSource', 'goalId', 'goalEffect', 'billId', 'splits', 'note'] as const

function quote(value: unknown) {
  const text = value == null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

export function transactionsToCSV(transactions: ExpenseTransaction[]) {
  return [columns.join(','), ...transactions.map(transaction => columns.map(column => quote(column === 'splits' ? JSON.stringify(transaction.splits || []) : transaction[column])).join(','))].join('\r\n')
}

function parseRows(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]
    if (quoted && char === '"' && csv[index + 1] === '"') { cell += '"'; index += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) { row.push(cell); cell = '' }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && csv[index + 1] === '\n') index += 1
      row.push(cell)
      if (row.some(value => value.length > 0)) rows.push(row)
      row = []
      cell = ''
    } else cell += char
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  return rows
}

export function transactionsFromCSV(csv: string): ExpenseTransaction[] {
  const [header = [], ...rows] = parseRows(csv)
  const indexes = new Map(header.map((value, index) => [value.trim(), index]))
  const value = (row: string[], key: string) => row[indexes.get(key) ?? -1]?.trim() || ''
  return rows.flatMap((row, index) => {
    const date = value(row, 'date')
    const amount = Number(value(row, 'amount'))
    const type = value(row, 'type') as ExpenseTransaction['type']
    const merchant = value(row, 'merchant')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(amount) || (type === 'adjustment' ? amount === 0 : amount <= 0) || !merchant || !['expense', 'income', 'transfer', 'adjustment'].includes(type || '')) return []
    let splits: ExpenseTransaction['splits']
    try {
      const parsed = JSON.parse(value(row, 'splits') || '[]')
      if (Array.isArray(parsed)) splits = parsed.filter(item => item && typeof item.category === 'string' && Number.isFinite(Number(item.amount))).map(item => ({ category: item.category, amount: Number(item.amount), budgetItem: typeof item.budgetItem === 'string' ? item.budgetItem : undefined }))
    } catch { splits = undefined }
    return [{
      id: value(row, 'id') || `import-${Date.now()}-${index}`,
      date,
      type,
      merchant,
      amount,
      category: value(row, 'category') || 'Other',
      budgetMode: value(row, 'budgetMode') === 'student' ? 'student' : 'worker',
      accountId: value(row, 'accountId') || undefined,
      toAccountId: value(row, 'toAccountId') || undefined,
      budgetItem: value(row, 'budgetItem') || undefined,
      incomeSource: value(row, 'incomeSource') as ExpenseTransaction['incomeSource'] || undefined,
      goalId: value(row, 'goalId') || undefined,
      goalEffect: value(row, 'goalEffect') as ExpenseTransaction['goalEffect'] || undefined,
      billId: value(row, 'billId') || undefined,
      splits,
      note: value(row, 'note') || undefined,
    }]
  })
}
