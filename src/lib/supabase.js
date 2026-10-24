import { createClient } from '@supabase/supabase-js'
import { createDemoClient } from './demo.js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Mode demo: data tiruan di browser. Aktif otomatis saat development tanpa .env, atau dipaksa dengan VITE_DEMO=1
export const demo = import.meta.env.VITE_DEMO === '1' || (import.meta.env.DEV && !(url && key))
export const configured = demo || Boolean(url && key)
export const supabase = demo ? createDemoClient() : configured ? createClient(url, key) : null
