'use client'
import { useState, useEffect, useCallback } from 'react'
import { Settings, HistoryEntry, DEFAULT_SETTINGS } from './types'

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('budget-settings')
      if (raw) {
        const saved = JSON.parse(raw)
        // Deep merge logic simplified: overwrite DEFAULT_SETTINGS with saved fields
        setSettingsState({
          ...DEFAULT_SETTINGS,
          ...saved,
          studentConfig: saved.studentConfig ? { ...DEFAULT_SETTINGS.studentConfig, ...saved.studentConfig } : DEFAULT_SETTINGS.studentConfig
        })
      }
    } catch {}
    setLoaded(true)
  }, [])

  const setSettings = useCallback((s: Settings | ((prev: Settings) => Settings)) => {
    setSettingsState(prev => {
      const next = typeof s === 'function' ? s(prev) : s
      localStorage.setItem('budget-settings', JSON.stringify(next))
      return next
    })
  }, [])

  return { settings, setSettings, loaded }
}

export function useHistory() {
  const [history, setHistoryState] = useState<HistoryEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('budget-history')
      if (raw) setHistoryState(JSON.parse(raw))
    } catch {}
    setLoaded(true)
  }, [])

  const addEntry = useCallback((entry: HistoryEntry) => {
    setHistoryState(prev => {
      const next = [entry, ...prev]
      localStorage.setItem('budget-history', JSON.stringify(next))
      return next
    })
  }, [])

  const removeEntry = useCallback((id: string) => {
    setHistoryState(prev => {
      const next = prev.filter(e => e.id !== id)
      localStorage.setItem('budget-history', JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistoryState([])
    localStorage.removeItem('budget-history')
  }, [])

  return { history, addEntry, removeEntry, clearHistory, loaded }
}
