'use client'
import { useState } from 'react'
import { useSettings, useHistory } from '@/lib/storage'
import Dashboard from '@/components/Dashboard'
import SettingsPanel from '@/components/SettingsPanel'
import HistoryTab from '@/components/HistoryTab'
import StudentTab from '@/components/StudentTab'
import { LayoutDashboard, Settings, History, GraduationCap } from 'lucide-react'

type Tab = 'dashboard' | 'settings' | 'history' | 'student'

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const { settings, setSettings, loaded } = useSettings()
  const { history, addEntry, removeEntry, clearHistory } = useHistory()

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student' as Tab, label: 'Student', icon: GraduationCap },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    { id: 'history' as Tab, label: 'History', icon: History },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-blue-700/10">₱</div>
              <span className="font-bold text-gray-800 tracking-tight hidden xs:block whitespace-nowrap">Budget Tracker</span>
            </div>
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide ml-2 sm:ml-4 py-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl font-semibold transition-all ${
                    tab === t.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <t.icon size={16} />
                  <span className={`${tab === t.id ? 'block' : 'hidden sm:block'}`}>{t.label}</span>
                  {t.id === 'history' && history.length > 0 && (
                    <span className={`text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-500 font-bold'}`}>
                      {history.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 transition-opacity duration-300">
        {tab === 'dashboard' && <Dashboard settings={settings} onSaveHistory={addEntry} />}
        {tab === 'student' && <StudentTab settings={settings} />}
        {tab === 'settings' && <SettingsPanel settings={settings} onUpdate={setSettings} />}
        {tab === 'history' && <HistoryTab history={history} onRemove={removeEntry} onClear={clearHistory} savingsGoal={settings.savingsGoal} />}
      </main>
    </div>
  )
}
