// scripts/check-env.ts
require('dotenv').config();

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'FOUND' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'FOUND' : 'MISSING');

// Also check if image files exist
const fs = require('fs');
const path = require('path');

const imageNames = Array.from({ length: 14 }, (_, i) => `img${i + 1}.png`);
console.log('\nChecking image files:');
for (const imageName of imageNames) {
  const imagePath = path.join(__dirname, '..', 'public', imageName);
  const exists = fs.existsSync(imagePath);
  console.log(`${imageName}: ${exists ? 'EXISTS' : 'MISSING'}`);
}