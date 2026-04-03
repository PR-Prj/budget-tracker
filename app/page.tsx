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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Portfolio</div>
        </div>
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
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-[#000] font-bold text-lg shadow-sm shadow-primary/20">
                ₱
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight hidden xs:block text-lg">
                Budget Tracker
              </span>
            </div>
            
            <nav className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm rounded-xl font-semibold transition-soft ${
                    tab === t.id 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <t.icon size={16} strokeWidth={2} />
                  <span className={`${tab === t.id ? 'block' : 'hidden md:block'}`}>{t.label}</span>
                  {t.id === 'history' && history.length > 0 && (
                    <span className={`text-[10px] min-w-[18px] h-[18px] px-1.5 flex items-center justify-center rounded-full ${
                      tab === t.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {history.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 transition-opacity duration-300">

        {tab === 'dashboard' && <Dashboard settings={settings} history={history} onSaveHistory={addEntry} />}
        {tab === 'student' && <StudentTab settings={settings} />}
        {tab === 'settings' && <SettingsPanel settings={settings} onUpdate={setSettings} />}
        {tab === 'history' && <HistoryTab history={history} onRemove={removeEntry} onClear={clearHistory} savingsGoal={settings.savingsGoal} />}
      </main>
    </div>
  )
}
