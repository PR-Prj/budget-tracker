'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { peso } from '@/lib/calc'

interface ChartData {
  name: string
  value: number
  color: string
}

interface BudgetChartProps {
  expenses: { name: string; amount: number }[]
  savings: number
  buffer: number
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Food': ['food', 'lunch', 'snacks', 'groceries', 'ref', 'mcd', 'dinner', 'breakfast'],
  'Transport': ['fare', 'grab', 'transpo', 'angkas', 'bus', 'jeep', 'tricycle', 'train', 'lrt', 'mrt'],
  'Bills & Rent': ['ambag', 'rent', 'housing', 'water', 'net', 'load', 'spotify', 'pmo', 'dogs', 'laundry'],
  'Entertainment': ['entertainment', 'fun', 'game', 'leisure', 'movie', 'hobby'],
}

const COLORS = {
  'Food': '#f59e0b',       // Amber 500
  'Transport': '#0ea5e9',  // Sky 500
  'Bills & Rent': '#6366f1', // Indigo 500
  'Entertainment': '#ec4899', // Pink 500
  'Savings': '#10b981',    // Emerald 500
  'Safety Buffer': '#14b8a6', // Teal 500
  'Other': '#94a3b8',      // Slate 400
}

export default function BudgetChart({ expenses, savings, buffer }: BudgetChartProps) {
  // Aggregate expenses into categories
  const categoryTotals: Record<string, number> = {
    'Food': 0,
    'Transport': 0,
    'Bills & Rent': 0,
    'Entertainment': 0,
    'Savings': savings,
    'Safety Buffer': Math.max(0, buffer),
    'Other': 0,
  }

  expenses.forEach(e => {
    const name = e.name.toLowerCase()
    let categorized = false
    
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
      if (keywords.some(k => name.includes(k))) {
        categoryTotals[cat] += e.amount
        categorized = true
        break
      }
    }
    
    if (!categorized) {
      categoryTotals['Other'] += e.amount
    }
  })

  const data: ChartData[] = Object.entries(categoryTotals)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS] || COLORS['Other']
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm shadow-slate-200/50">
      <div className="flex flex-col gap-1 mb-8">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Allocation</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Spending & Savings Visualized</p>
      </div>

      <div className="h-[300px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => peso(Number(value) || 0)}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '12px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center of the donut display */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Total Flow</span>
          <span className="text-xl font-black text-slate-900">{peso(data.reduce((a,b) => a + b.value, 0))}</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.map((item, i) => (
          <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 transition-soft hover:bg-white hover:border-slate-200 group">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
             </div>
             <span className="text-sm font-black text-slate-800 transition-colors group-hover:text-primary">{peso(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
