// src/app/admin/page.tsx
import { redirect } from 'next/navigation';

// Since the dashboard is already set up with client-side auth,
// let's redirect to the dashboard page directly
export default function AdminPage() {
  // Redirect to the actual dashboard since that handles auth
  redirect('/admin/dashboard');
}