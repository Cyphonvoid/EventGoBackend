import { createClient } from '@supabase/supabase-js';
//export const supabaseClient = createClient(process.env.SUPA_URL, process.env.SUPA_ANON_KEY)
//export const supabaseAdminClient = createClient(process.env.SUPA_URL, process.env.SUPA_SERVICE_KEY)
export const SUPA_URL = "https://hhcrpjkcliunjhyvrjna.supabase.co"
export const SUPA_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoY3JwamtjbGl1bmpoeXZyam5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg2OTAwMjUsImV4cCI6MjAzNDI2NjAyNX0.30kTdNs_u5CCETTXqjYI93y2wvQl7FDrHEoUCUALw7Q"
export const SUPA_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoY3JwamtjbGl1bmpoeXZyam5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY5MDAyNSwiZXhwIjoyMDM0MjY2MDI1fQ.fxUVxu5D0DMXUyq7lSht1R_PY0dWNu8oA1hmgIIiUR4"
export const supabaseClient = createClient(SUPA_URL, SUPA_ANON_KEY)
export const supabaseAdminClient = createClient(SUPA_URL, SUPA_SERVICE_KEY)