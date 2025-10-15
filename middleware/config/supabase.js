// config/supabase.js - Safe version with error handling
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Check if environment variables exist
if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️  Supabase: Environment variables not found. Disabling Supabase.');
  console.log('💡 To enable Supabase, add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file');
  module.exports = null;
  return;
}

try {
  // Only create client if variables exist
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized successfully');
  module.exports = supabase;
} catch (error) {
  console.error('❌ Supabase initialization failed:', error.message);
  module.exports = null;
}