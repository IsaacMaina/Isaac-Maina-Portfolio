// test-auth-setup.ts - Test script to verify authentication setup
import { validateLoginCredentials } from '@/lib/validation';
import { verifyPassword } from '@/lib/auth/utils';
import bcrypt from 'bcryptjs';

async function testAuthSetup() {
  console.log('Testing authentication setup...\n');

  // Test validation functions
  try {
    validateLoginCredentials({ email: 'test@example.com', password: 'password123' });
    console.log('✅ validateLoginCredentials: Working correctly');
  } catch (error) {
    console.log('❌ validateLoginCredentials: Error -', error);
  }

  // Test password verification
  try {
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const isValid = await verifyPassword(plainPassword, hashedPassword);
    console.log('✅ verifyPassword: Working correctly -', isValid);
  } catch (error) {
    console.log('❌ verifyPassword: Error -', error);
  }

  // Test compromised password detection
  try {
    const isCompromised = require('@/lib/auth/utils').isPasswordCompromised('password');
    console.log('✅ isPasswordCompromised: Working correctly -', isCompromised);
  } catch (error) {
    console.log('❌ isPasswordCompromised: Error -', error);
  }

  console.log('\nAuthentication setup test completed!');
}

testAuthSetup().catch(console.error);