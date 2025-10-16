// scripts/export-data.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function exportData() {
  // Export users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
  
  if (!usersError) {
    fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2))
  }

  // Export other tables as needed
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
  
  if (!postsError) {
    fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2))
  }
}

exportData();