'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AdminProtectedProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export default function AdminProtected({ children, requiredPermissions = [] }: AdminProtectedProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading

    if (!session) {
      // If no session, redirect to sign in
      router.push('/auth/signin');
      return;
    }

    // Check if user has required permissions (if any)
    if (requiredPermissions.length > 0) {
      // In a real implementation, you would check permissions here
      // For this example, I'll assume admin users have access to everything
      const userRole = session.user.role;
      if (userRole !== 'ADMIN' && userRole !== 'admin') {
        // Redirect to home if user doesn't have required permissions
        router.push('/');
        return;
      }
    }

    // If session exists and user has required permissions, allow access
    setAuthorized(true);
  }, [session, status, router, requiredPermissions]);

  // Show loading state while checking auth
  if (status === 'loading' || !authorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan mb-4"></div>
          <p className="text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is authorized, render children
  return <>{children}</>;
}