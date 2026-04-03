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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">₱</div>
              <span className="font-bold text-gray-800">Budget Tracker</span>
              <span className="text-xs text-gray-400 hidden sm:block">PH Semi-monthly</span>
            </div>
            <nav className="flex items-center gap-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    tab === t.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <t.icon size={15} />
                  <span className="hidden sm:inline">{t.label}</span>
                  {t.id === 'history' && history.length > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'dashboard' && <Dashboard settings={settings} onSaveHistory={addEntry} />}
        {tab === 'student' && <StudentTab settings={settings} />}
        {tab === 'settings' && <SettingsPanel settings={settings} onUpdate={setSettings} />}
        {tab === 'history' && <HistoryTab history={history} onRemove={removeEntry} onClear={clearHistory} savingsGoal={settings.savingsGoal} />}
      </main>
    </div>
  )
}
