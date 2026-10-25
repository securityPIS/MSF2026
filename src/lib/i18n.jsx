import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// Bahasa tampilan: 'id' (default) atau 'en', disimpan per perangkat.
// Teks ditulis langsung di kode sebagai pasangan tr('Indonesia', 'English').
const STORAGE_KEY = 'msf2026.lang'

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'id'
  } catch {
    return 'id'
  }
}

let current = readStored()

export const tr = (id, en) => (current === 'en' ? en : id)
export const locale = () => (current === 'en' ? 'en-GB' : 'id-ID')

const LangContext = createContext({ lang: current, setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(current)

  const setLang = useCallback((next) => {
    current = next === 'en' ? 'en' : 'id'
    try {
      localStorage.setItem(STORAGE_KEY, current)
    } catch { /* penyimpanan diblokir: bahasa berlaku sampai halaman ditutup */ }
    setLangState(current)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
