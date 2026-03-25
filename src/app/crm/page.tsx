'use client';

import { useState } from 'react';
import { useFormModal } from '@/components/ui/FormModalContext';
import { Users, Plus, Search, Mail, Phone, MapPin, Building2, MoreVertical, ChevronRight, Star, Edit } from 'lucide-react';

const clients = [
  {
    id: 1,
    name: 'AEC Living Co., Ltd.',
    contact: 'Prasert S.',
    email: 'prasert@aecgroup.co.th',
    phone: '+66 2 888 1234',
    location: 'Bangkok',
    type: 'Architectural Firm',
    totalOrders: 12,
    totalValue: 2847000,
    lastOrder: '2026-03-24',
    status: 'active',
    tier: 'gold',
  },
  {
    id: 2,
    name: 'Skyline Interior Design',
    contact: 'Niran K.',
    email: 'niran@skyline-id.com',
    phone: '+66 81 234 5678',
    location: 'Nonthaburi',
    type: 'Interior Design',
    totalOrders: 8,
    totalValue: 1245000,
    lastOrder: '2026-03-23',
    status: 'active',
    tier: 'silver',
  },
  {
    id: 3,
    name: 'Modern Home Corporation',
    contact: 'Siriwan T.',
    email: 'siriwan@modernhometh.com',
    phone: '+66 3 888 9999',
    location: 'Chiang Mai',
    type: 'Developer',
    totalOrders: 15,
    totalValue: 4120000,
    lastOrder: '2026-03-22',
    status: 'active',
    tier: 'gold',
  },
  {
    id: 4,
    name: 'Urban Build Co.',
    contact: 'Chaiyasit P.',
    email: 'chaiyasit@urbanbuild.co',
    phone: '+66 85 111 2233',
    location: 'Phuket',
    type: 'Contractor',
    totalOrders: 4,
    totalValue: 384000,
    lastOrder: '2026-03-20',
    status: 'active',
    tier: 'bronze',
  },
  {
    id: 5,
    name: 'Lumpoon Architecture Studio',
    contact: 'Anong R.',
    email: 'anong@lumpoon-arch.com',
    phone: '+66 88 555 6677',
    location: 'Songkhla',
    type: 'Architectural Firm',
    totalOrders: 6,
    totalValue: 1890000,
    lastOrder: '2026-03-18',
    status: 'inactive',
    tier: 'silver',
  },
];

export default function CrmPage() {
  const [search, setSearch]   = useState('');
  const { openForm } = useFormModal();
  const [tier, setTier]       = useState('all');

  const filtered = clients.filter(c => {
    const match = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase());
    const matchTier = tier === 'all' || c.tier === tier;
    return match && matchTier;
  });

  const tierColor: Record<string, string> = {
    gold:   'text-yellow-600',
    silver: 'text-slate-400',
    bronze: 'text-orange-400',
  };

  const tierBg: Record<string, string> = {
    gold:   'bg-yellow-50 border-yellow-200',
    silver: 'bg-slate-50 border-slate-200',
    bronze: 'bg-orange-50 border-orange-200',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Header */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            Client Relations
          </div>
          <h1 className="page-header-title">Clients</h1>
          <p className="page-header-subtitle">{clients.length} active business partners</p>
        </div>
        <button className="btn-primary" onClick={() => openForm('client')}>
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {[
          { label: 'Total Clients',    value: '86' },
          { label: 'Active (30d)',     value: '23' },
          { label: 'Revenue (Client)', value: '฿2.4M' },
          { label: 'Avg. Lifetime',    value: '฿28K' },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-value text-xl">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
          <input
            className="input-field-search w-full"
            placeholder="Search clients or contacts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'gold', 'silver', 'bronze'].map(t => (
            <button key={t} onClick={() => setTier(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                tier === t
                  ? 'signature-gradient text-white shadow-sm'
                  : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
              }`}>
              {t === 'all' ? 'All Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
        {filtered.map(client => (
          <div key={client.id} className="card-elevated p-6 group hover:border-[var(--primary-pale)] transition-all">

            {/* Top: Avatar + Tier badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-headline font-black text-lg text-white
                  ${client.tier === 'gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    client.tier === 'silver' ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                    'bg-gradient-to-br from-orange-300 to-orange-500'}`}>
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-sm text-[var(--on-surface)] leading-tight">
                    {client.name}
                  </h3>
                  <p className="text-xs text-[var(--on-surface-variant)]">{client.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-secondary'} capitalize`}>
                  {client.status}
                </span>
                <button className="p-1 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] rounded-lg hover:bg-[var(--surface-container-low)] transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                <Users className="w-3.5 h-3.5" />
                <span>{client.contact}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                <Mail className="w-3.5 h-3.5" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                <Phone className="w-3.5 h-3.5" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                <MapPin className="w-3.5 h-3.5" />
                <span>{client.location}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 pt-4 border-t border-[var(--outline-variant)]">
              <div className="flex-1 text-center">
                <p className="font-headline font-bold text-[var(--on-surface)]">{client.totalOrders}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold">Orders</p>
              </div>
              <div className="flex-1 text-center">
                <p className="font-headline font-bold text-[var(--on-surface)]">
                  ฿{(client.totalValue / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold">Total</p>
              </div>
              <div className="flex-1 text-center">
                <p className="font-headline font-bold text-[var(--on-surface)]">{client.lastOrder.split('-').slice(1).join('/')}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold">Last Order</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 btn-primary text-xs py-2">
                <Edit className="w-3 h-3" />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="empty-state-title">No clients found</h3>
          <p className="empty-state-desc">Try adjusting your search or add a new client.</p>
          <button className="btn-primary" onClick={() => openForm('client')}><Plus className="w-4 h-4" />Add Client</button>
        </div>
      )}
      
    </div>
  );
}
