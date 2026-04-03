export type MonthType = 'heavy' | 'light'
export type SpecialMonth = string[] // Array of IDs of AdditionalPayment

export interface CustomExpense {
  id: string
  name: string
  amount: number
  isHeavyOnly: boolean
  wallet?: string
}

export interface CutoffConfig {
  income: number
  baseExpenses: Record<string, number>
  heavyExpenses: Record<string, number>
  expenseWallets: Record<string, string> // maps expense name to wallet name
  customExpenses: CustomExpense[]
}

export interface AdditionalPayment {
  id: string
  month: string
  cutoff15: number
  cutoff30: number
}

export interface StudentConfig {
  dailyAllowance: number
  schoolDaysPerWeek: number
  baseDailyExpenses?: Record<string, number>
  weeklySchoolExtra?: Record<string, number>
  expenseWallets?: Record<string, string>
  customExpenses?: CustomExpense[]
  savingsGoal?: number
  savingsSplit?: number
}

export interface Settings {
  cutoff15: CutoffConfig
  cutoff30: CutoffConfig
  additionalPayments: AdditionalPayment[]
  savingsGoal: number
  savingsSplit: number // percent to savings (0-100), rest goes to buffer
  studentConfig: StudentConfig
}

export interface HistoryEntry {
  id: string
  month: string // e.g. "2025-04"
  label: string // e.g. "April 2025"
  monthType: MonthType
  specialMonth: SpecialMonth
  cutoff15: {
    income: number
    expenses: { name: string; amount: number; category: string; wallet?: string }[]
    totalExpenses: number
    remaining: number
    savings: number
    buffer: number
  }
  cutoff30: {
    income: number
    expenses: { name: string; amount: number; category: string; wallet?: string }[]
    totalExpenses: number
    remaining: number
    savings: number
    buffer: number
  }
  totalSavings: number
  totalExpenses: number
  createdAt: string
}

export const DEFAULT_SETTINGS: Settings = {
  savingsGoal: 10000,
  savingsSplit: 50,
  additionalPayments: [
    { id: 'apr', month: 'April', cutoff15: 860, cutoff30: 0 },
    { id: 'may', month: 'May', cutoff15: 770, cutoff30: 0 },
    { id: 'jun', month: 'June', cutoff15: 660, cutoff30: 0 },
  ],
  cutoff15: {
    income: 7800,
    baseExpenses: {
      'Ambag + net': 2000,
      'Ref': 700,
      'Dogs': 820,
      'Load': 179,
      'Water': 70,
      'Laundry': 425,
    },
    heavyExpenses: {
      'Food': 900,
      'Fare': 1100,
    },
    expenseWallets: {},
    customExpenses: [],
  },
  cutoff30: {
    income: 10000,
    baseExpenses: {
      'Ambag': 2000,
      'Dogs': 820,
      'Load': 179,
      'Spotify': 200,
      'PMO': 700,
      'Water': 70,
      'Laundry': 425,
    },
    heavyExpenses: {
      'Food': 900,
      'Fare': 1100,
    },
    expenseWallets: {},
    customExpenses: [],
  },
  studentConfig: {
    dailyAllowance: 200,
    schoolDaysPerWeek: 5,
    baseDailyExpenses: {
      'Transpo': 40,
      'Lunch': 80,
      'Snacks': 30,
    },
    weeklySchoolExtra: {
      'Projects': 150,
      'Internet/Loading': 50,
    },
    customExpenses: [],
    savingsGoal: 5000,
    savingsSplit: 70,
  },
}
