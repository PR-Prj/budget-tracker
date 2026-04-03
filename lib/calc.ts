import { Settings, MonthType, SpecialMonth, HistoryEntry, AdditionalPayment, SavingsJar } from './types'

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
  monthKey: string,
  actuals15: Record<string, number> = {},
  actuals30: Record<string, number> = {},
  actualIncome15?: number,
  actualIncome30?: number
): HistoryEntry {
  const c15 = calcCutoff15(settings, monthType, specialMonth)
  const c30 = calcCutoff30(settings, monthType, specialMonth)

  const processExpenses = (expenses: ExpenseItem[], actuals: Record<string, number>) => {
    let totalActual = 0
    const items = expenses.map(e => {
      const actual = actuals[e.name] !== undefined ? actuals[e.name] : e.amount
      totalActual += actual
      return { 
        name: e.name, 
        amount: e.amount, 
        actualAmount: actual,
        category: e.category,
        wallet: e.wallet 
      }
    })
    return { items, totalActual }
  }

  const res15 = processExpenses(c15.expenses, actuals15)
  const res30 = processExpenses(c30.expenses, actuals30)

  const finalIncome15 = actualIncome15 !== undefined ? actualIncome15 : c15.income
  const finalIncome30 = actualIncome30 !== undefined ? actualIncome30 : c30.income

  const entry: HistoryEntry = {
    id: `${monthKey}-${Date.now()}`,
    month: monthKey,
    label: monthLabel,
    monthType,
    specialMonth,
    cutoff15: {
      income: c15.income,
      actualIncome: actualIncome15,
      expenses: res15.items,
      totalExpenses: c15.totalExpenses,
      totalActualExpenses: res15.totalActual,
      variance: c15.totalExpenses - res15.totalActual,
      remaining: finalIncome15 - res15.totalActual,
      savings: Math.max(0, Math.round((finalIncome15 - res15.totalActual) * (settings.savingsSplit / 100))),
      buffer: (finalIncome15 - res15.totalActual) - Math.max(0, Math.round((finalIncome15 - res15.totalActual) * (settings.savingsSplit / 100))),
    },
    cutoff30: {
      income: c30.income,
      actualIncome: actualIncome30,
      expenses: res30.items,
      totalExpenses: c30.totalExpenses,
      totalActualExpenses: res30.totalActual,
      variance: c30.totalExpenses - res30.totalActual,
      remaining: finalIncome30 - res30.totalActual,
      savings: Math.max(0, Math.round((finalIncome30 - res30.totalActual) * (settings.savingsSplit / 100))),
      buffer: (finalIncome30 - res30.totalActual) - Math.max(0, Math.round((finalIncome30 - res30.totalActual) * (settings.savingsSplit / 100))),
    },
    totalSavings: 0, 
    totalExpenses: res15.totalActual + res30.totalActual,
    createdAt: new Date().toISOString(),
  }
  
  entry.totalSavings = entry.cutoff15.savings + entry.cutoff30.savings
  return entry
}

export function distributeSavingsToJars(totalSavings: number, jars: SavingsJar[] = []): { jar: SavingsJar; amount: number }[] {
  if (jars.length === 0) return []
  return jars.map(jar => ({
    jar,
    amount: Math.round(totalSavings * (jar.splitPercent / 100))
  }))
}

export function peso(v: number): string {
  return '₱' + Math.round(v).toLocaleString()
}

export function getMonthsToGoal(goal: number, monthlySavings: number): number | null {
  if (monthlySavings <= 0) return null
  return Math.ceil(goal / monthlySavings)
}
