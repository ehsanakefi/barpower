"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requiredRole && !requiredRole.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/user');
        }
        return;
      }
    }
  }, [user, isLoading, router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}