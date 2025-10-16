// scripts/seed.js
const { createClient } = require('@supabase/supabase-js')
const { users, posts } = require('../seeds/seed-data')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function seedDatabase() {
  // Insert users
  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .insert(user)
    
    if (error) console.error('Error inserting user:', error)
  }

  // Insert posts
  for (const post of posts) {
    const { error } = await supabase
      .from('posts')
      .insert(post)
    
    if (error) console.error('Error inserting post:', error)
  }
}

seedDatabase();