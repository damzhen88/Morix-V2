'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="text-center max-w-md px-6">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl signature-gradient flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}>
          <span className="text-white font-black text-2xl">M</span>
        </div>

        {/* Error card */}
        <div className="card-elevated p-8 text-center">
          <div className="w-14 h-14 rounded-xl bg-[var(--error-container)] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-[var(--error)]" />
          </div>

          <h1 className="font-headline text-2xl font-black text-[var(--on-surface)] mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-[var(--on-surface-variant)] mb-6 leading-relaxed">
            We encountered an unexpected error. Our team has been notified.
            {error.digest && (
              <span className="block mt-2 text-xs text-[var(--outline)] font-mono">
                Error ID: {error.digest}
              </span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="btn-primary"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link href="/" className="btn-secondary">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}