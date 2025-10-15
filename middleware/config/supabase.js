// config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Safe initialization with fallback
let supabaseClient = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error.message);
    supabaseClient = null;
  }
} else {
  console.log('ℹ️  Supabase not configured - using fallback database');
}

module.exports = supabaseClient;