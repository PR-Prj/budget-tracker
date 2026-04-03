import { Settings, MonthType, SpecialMonth, HistoryEntry, AdditionalPayment } from './types'

export function getSpecialExtra(specialMonth: SpecialMonth, payments: AdditionalPayment[], cutoff: 15 | 30): number {
  if (!specialMonth.length) return 0
  return specialMonth.reduce((sum, id) => {
    const p = payments.find(ap => ap.id === id)
    if (!p) return sum
    return sum + (cutoff === 15 ? p.cutoff15 : p.cutoff30)
  }, 0)
}

export interface ExpenseItem {
  name: string
  amount: number
  category: 'base' | 'heavy' | 'custom' | 'additional'
  wallet?: string
}

export interface CutoffResult {
  income: number
  expenses: ExpenseItem[]
  totalExpenses: number
  remaining: number
  savings: number
  buffer: number
}

export function calcCutoff15(
  settings: Settings,
  monthType: MonthType,
  specialMonth: SpecialMonth
): CutoffResult {
  const cfg = settings.cutoff15
  const split = settings.savingsSplit / 100
  const expenses: ExpenseItem[] = []

  Object.entries(cfg.baseExpenses).forEach(([name, amount]) => {
    if (amount > 0) {
      expenses.push({ 
        name, 
        amount, 
        category: 'base', 
        wallet: cfg.expenseWallets?.[name] 
      })
    }
  })

  if (monthType === 'heavy') {
    Object.entries(cfg.heavyExpenses).forEach(([name, amount]) => {
      if (amount > 0) {
        expenses.push({ 
          name, 
          amount, 
          category: 'heavy', 
          wallet: cfg.expenseWallets?.[name] 
        })
      }
    })
  }

  cfg.customExpenses.forEach(e => {
    if (e.amount > 0 && e.name && (monthType === 'heavy' || !e.isHeavyOnly)) {
      expenses.push({ 
        name: e.name, 
        amount: e.amount, 
        category: 'custom',
        wallet: e.wallet 
      })
    }
  })

  specialMonth.forEach(id => {
    const p = settings.additionalPayments.find(ap => ap.id === id)
    if (p && p.cutoff15 > 0) {
      expenses.push({ name: `${p.month} extra`, amount: p.cutoff15, category: 'additional' })
    }
  })

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const remaining = cfg.income - totalExpenses
  const savings = Math.max(0, Math.round(remaining * split))
  const buffer = remaining - savings

  return { income: cfg.income, expenses, totalExpenses, remaining, savings, buffer }
}

export function calcCutoff30(
  settings: Settings,
  monthType: MonthType,
  specialMonth: SpecialMonth
): CutoffResult {
  const cfg = settings.cutoff30
  const split = settings.savingsSplit / 100
  const expenses: ExpenseItem[] = []

  Object.entries(cfg.baseExpenses).forEach(([name, amount]) => {
    if (amount > 0) {
      expenses.push({ 
        name, 
        amount, 
        category: 'base', 
        wallet: cfg.expenseWallets?.[name] 
      })
    }
  })

  if (monthType === 'heavy') {
    Object.entries(cfg.heavyExpenses).forEach(([name, amount]) => {
      if (amount > 0) {
        expenses.push({ 
          name, 
          amount, 
          category: 'heavy', 
          wallet: cfg.expenseWallets?.[name] 
        })
      }
    })
  }

  cfg.customExpenses.forEach(e => {
    if (e.amount > 0 && e.name && (monthType === 'heavy' || !e.isHeavyOnly)) {
      expenses.push({ 
        name: e.name, 
        amount: e.amount, 
        category: 'custom',
        wallet: e.wallet 
      })
    }
  })

  specialMonth.forEach(id => {
    const p = settings.additionalPayments.find(ap => ap.id === id)
    if (p && p.cutoff30 > 0) {
      expenses.push({ name: `${p.month} extra`, amount: p.cutoff30, category: 'additional' })
    }
  })

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const remaining = cfg.income - totalExpenses
  const savings = Math.max(0, Math.round(remaining * split))
  const buffer = remaining - savings

  return { income: cfg.income, expenses, totalExpenses, remaining, savings, buffer }
}

export function buildHistoryEntry(
  settings: Settings,
  monthType: MonthType,
  specialMonth: SpecialMonth,
  monthLabel: string,
  monthKey: string
): HistoryEntry {
  const c15 = calcCutoff15(settings, monthType, specialMonth)
  const c30 = calcCutoff30(settings, monthType, specialMonth)

  return {
    id: `${monthKey}-${Date.now()}`,
    month: monthKey,
    label: monthLabel,
    monthType,
    specialMonth,
    cutoff15: {
      income: c15.income,
      expenses: c15.expenses.map(e => ({ 
        name: e.name, 
        amount: e.amount, 
        category: e.category,
        wallet: e.wallet 
      })),
      totalExpenses: c15.totalExpenses,
      remaining: c15.remaining,
      savings: c15.savings,
      buffer: c15.buffer,
    },
    cutoff30: {
      income: c30.income,
      expenses: c30.expenses.map(e => ({ 
        name: e.name, 
        amount: e.amount, 
        category: e.category,
        wallet: e.wallet 
      })),
      totalExpenses: c30.totalExpenses,
      remaining: c30.remaining,
      savings: c30.savings,
      buffer: c30.buffer,
    },
    totalSavings: c15.savings + c30.savings,
    totalExpenses: c15.totalExpenses + c30.totalExpenses,
    createdAt: new Date().toISOString(),
  }
}

export function peso(v: number): string {
  return '₱' + Math.round(v).toLocaleString()
}

export function getMonthsToGoal(goal: number, monthlySavings: number): number | null {
  if (monthlySavings <= 0) return null
  return Math.ceil(goal / monthlySavings)
}
