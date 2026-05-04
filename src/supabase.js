import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Esta variable "supabase" es la que usaremos en toda la web para leer y guardar partidos
export const supabase = createClient(supabaseUrl, supabaseAnonKey)