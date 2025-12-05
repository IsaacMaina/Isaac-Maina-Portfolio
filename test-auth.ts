// Test script to check the auth config
import { handlers } from "@/lib/auth/authConfig";

console.log('Handlers object:', handlers);
console.log('GET handler exists:', typeof handlers.GET !== 'undefined');
console.log('POST handler exists:', typeof handlers.POST !== 'undefined');

if (handlers && handlers.GET && handlers.POST) {
  console.log('✅ Auth config is working correctly');
} else {
  console.log('❌ Auth config has issues - handlers are not properly exported');
}