'use client'
import { useState, useEffect, useCallback } from 'react'
import { Settings, HistoryEntry, ExpenseTransaction, DEFAULT_SETTINGS } from './types'

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(() => {
    const saved = readStored<Partial<Settings>>('budget-settings', {})
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      studentConfig: saved.studentConfig ? { ...DEFAULT_SETTINGS.studentConfig, ...saved.studentConfig } : DEFAULT_SETTINGS.studentConfig,
    }
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 0)
    return () => window.clearTimeout(timer)
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
  const [history, setHistoryState] = useState<HistoryEntry[]>(() => readStored('budget-history', []))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 0)
    return () => window.clearTimeout(timer)
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

export function useTransactions() {
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>(() => readStored('budget-transactions', []))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const addTransaction = useCallback((entry: ExpenseTransaction) => {
    setTransactions(prev => {
      const next = [entry, ...prev]
      localStorage.setItem('budget-transactions', JSON.stringify(next))
      return next
    })
  }, [])

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const next = prev.filter(entry => entry.id !== id)
      localStorage.setItem('budget-transactions', JSON.stringify(next))
      return next
    })
  }, [])

  return { transactions, addTransaction, removeTransaction, loaded }
}
