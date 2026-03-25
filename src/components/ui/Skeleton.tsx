'use client';

import React from 'react';

// ─────────────────────────────────────────
// KPI Skeleton Card
// ─────────────────────────────────────────
export function KPICardSkeleton() {
  return (
    <div className="kpi-card animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--surface-container-high)]" />
        <div className="w-12 h-6 rounded-full bg-[var(--surface-container-high)]" />
      </div>
      <div className="w-20 h-8 rounded-lg bg-[var(--surface-container-high)] mb-2" />
      <div className="w-28 h-4 rounded bg-[var(--surface-container-high)]" />
    </div>
  );
}

// ─────────────────────────────────────────
// Table Row Skeleton
// ─────────────────────────────────────────
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-[var(--outline-variant)]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded bg-[var(--surface-container-high)] animate-pulse"
            style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─────────────────────────────────────────
// Card Grid Skeleton
// ─────────────────────────────────────────
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-elevated p-5 animate-pulse">
          <div className="w-full aspect-[4/3] rounded-xl bg-[var(--surface-container-high)] mb-4" />
          <div className="space-y-2">
            <div className="h-4 rounded bg-[var(--surface-container-high)] w-3/4" />
            <div className="h-3 rounded bg-[var(--surface-container-high)] w-1/2" />
            <div className="h-3 rounded bg-[var(--surface-container-high)] w-2/3" />
          </div>
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────
// Activity Feed Skeleton
// ─────────────────────────────────────────
export function ActivitySkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-container-high)] animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded bg-[var(--surface-container-high)] w-2/3 animate-pulse" />
            <div className="h-3 rounded bg-[var(--surface-container-high)] w-1/3 animate-pulse" />
          </div>
          <div className="h-4 w-16 rounded bg-[var(--surface-container-high)] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Full Page Skeleton (for initial load)
// ─────────────────────────────────────────
export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-[var(--surface-container-high)]" />
        <div className="h-8 w-48 rounded bg-[var(--surface-container-high)]" />
      </div>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <KPICardSkeleton key={i} />)}
      </div>
      {/* Content */}
      <div className="card-elevated p-6">
        <div className="h-5 w-40 rounded bg-[var(--surface-container-high)] mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-[var(--surface-container-high)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
