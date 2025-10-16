// seeds/seed-data.js
export const users = [
  {
    id: 'uuid-here',
    email: 'user@example.com',
    created_at: new Date().toISOString()
  }
]

export const posts = [
  {
    id: 'uuid-here',
    user_id: 'uuid-here',
    title: 'Sample Post',
    content: 'This is a sample post',
    created_at: new Date().toISOString()
  }
]