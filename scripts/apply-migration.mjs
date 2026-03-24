import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Read migration file
const migrationPath = join(__dirname, '../supabase/migrations/001_initial_schema.sql')
const migrationSQL = readFileSync(migrationPath, 'utf8')

console.log('📦 Applying migration to Supabase...\n')

// Since Supabase doesn't have direct SQL execution via REST API,
// we'll execute each CREATE/INSERT statement using the database connection
// For now, let's just verify the connection works and guide the user

async function testConnection() {
  // Try to query an existing table (this will fail if tables don't exist yet)
  const { data, error } = await supabase.from('users').select('*').limit(1)

  if (error) {
    if (error.message.includes('relation "public.users" does not exist')) {
      console.log('ℹ️  Tables do not exist yet - migration needs to be applied\n')
      console.log('📋 Please apply the migration manually:\n')
      console.log('1. Go to: https://supabase.com/dashboard/project/vdcvmwubhqqfcjlurhlk/sql')
      console.log('2. Click "New Query"')
      console.log('3. Copy the contents of: supabase/migrations/001_initial_schema.sql')
      console.log('4. Paste and run it\n')
      return false
    } else {
      console.error('❌ Connection error:', error)
      return false
    }
  }

  console.log('✅ Connection successful!')
  console.log('✅ Tables already exist!')
  console.log(`Found ${data.length} users\n`)
  return true
}

testConnection()
