import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fjhjnnxrsawiqbbdaiyz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGpubnhyc2F3aXFiYmRhaXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMTI3MzYsImV4cCI6MjEwMTY4ODczNn0.8rJ4t6jz5yXsVXFW0eiJuxqBpgE3M-TzUSM_Bmy4ly8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
