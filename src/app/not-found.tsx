'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="text-center max-w-md px-6">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl signature-gradient flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}>
          <span className="text-white font-black text-2xl">M</span>
        </div>

        {/* 404 card */}
        <div className="card-elevated p-10 text-center">
          <p className="font-headline text-8xl font-black text-[var(--surface-container)] mb-4">404</p>
          <h1 className="font-headline text-2xl font-bold text-[var(--on-surface)] mb-2">
            Page not found
          </h1>
          <p className="text-sm text-[var(--on-surface-variant)] mb-8 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <button onClick={() => router.back()} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}