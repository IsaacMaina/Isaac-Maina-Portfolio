// test-env-direct.ts
// Direct test to see if environment variables load properly
import('dotenv').then(dotenv => {
  dotenv.config({ path: './.env.local' });
  
  console.log('Direct dotenv load - DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('Direct dotenv load - DATABASE_URL value:', process.env.DATABASE_URL);
  console.log('Available environment variables:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NEON') || k.includes('NEXT')));
}).catch(err => {
  console.error('Error loading dotenv:', err);
});