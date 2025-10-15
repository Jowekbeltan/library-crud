const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are missing!');
  console.log('💡 Please check your .env file for SUPABASE_URL and SUPABASE_ANON_KEY');
  // You can choose to exit or continue without Supabase
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;