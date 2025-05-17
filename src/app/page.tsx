
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldHalf } from 'lucide-react'; // Icon for app logo

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || (!isLoading && isAuthenticated)) {
    // Show a loading spinner or a blank page while checking auth / redirecting
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
        <ShieldHalf className="h-16 w-16 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary pattern-dots pattern-primary pattern-opacity-10 pattern-size-4">
       <div className="absolute top-8 left-8 flex items-center space-x-2">
         <ShieldHalf className="h-10 w-10 text-primary" />
         <h1 className="text-2xl font-bold text-foreground">Mobile Forensics Hub</h1>
       </div>
      <LoginForm />
    </main>
  );
}

