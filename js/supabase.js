import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://hbtluofnwsjcwaalcbup.supabase.co'
const supabaseKey = 'sb_publishable_5C02aq7_lH5Xdv_7U7hIsw_58skDvB3'

export const supabase = createClient(supabaseUrl, supabaseKey)