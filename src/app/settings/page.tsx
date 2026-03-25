'use client';

import { useState } from 'react';
import {
  Database, CreditCard, Receipt, Truck, UserPlus,
  ChevronRight, Award, Eye, Save, X, Plus, Bell,
  Globe, Building2, Info, CreditCardIcon, ShieldCheck
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

type Tab = 'identity' | 'general' | 'financial' | 'notifications' | 'users';
const TABS: { id: Tab; label: string }[] = [
  { id: 'identity',      label: 'Identity' },
  { id: 'general',       label: 'General' },
  { id: 'financial',     label: 'Financial' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'users',        label: 'Access Control' },
];

const teamMembers = [
  { name: 'Admin User',  email: 'admin@morix.co.th',   role: 'Admin',  status: 'active',  last: 'Today, 09:42 AM',    initial: 'A', color: '#F97316' },
  { name: 'Editor User', email: 'editor@morix.co.th',  role: 'Editor', status: 'active',  last: 'Yesterday, 04:15 PM', initial: 'E', color: '#3B82F6' },
  { name: 'Viewer User', email: 'viewer@morix.co.th',  role: 'Viewer', status: 'offline', last: '2 days ago',          initial: 'V', color: '#8B5CF6' },
];

const ROLE_DESC: Record<string, string> = {
  Admin:  'Full access — manage users, settings, and all data',
  Editor: 'Can create and edit products, orders, and clients',
  Viewer: 'Read-only access to dashboard and reports',
};

const NOTIFS = [
  { id: 'low_stock',      label: 'Low Stock Alerts',    desc: 'Alert when inventory falls below reorder level' },
  { id: 'new_order',     label: 'New Orders',          desc: 'Notify when a new sale or purchase order is created' },
  { id: 'expense',       label: 'Expense Records',     desc: 'Notify on new expense entries over ฿10,000' },
  { id: 'new_client',    label: 'New Client Added',   desc: 'Alert when a new client is added to the system' },
  { id: 'delivery',      label: 'Delivery Updates',   desc: 'Track PO delivery status changes' },
  { id: 'weekly_report', label: 'Weekly Summary',    desc: 'Receive weekly performance summary via email' },
];

export default function SettingsPage() {
  const [tab, setTab]           = useState<Tab>('identity');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('Editor');
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    low_stock: true, new_order: true, expense: false, new_client: true, delivery: false, weekly_report: true,
  });
  const [general, setGeneral] = useState({
    companyName: 'MORIX DECORATIVE', slug: 'decorative',
    language: 'Thai (ประเทศไทย)', timezone: '(GMT+07:00) Bangkok, Hanoi',
    currency: 'Thai Baht (THB)', dateFormat: 'DD/MM/YYYY',
  });
  const [financial, setFinancial] = useState({
    currency: 'THB', tax: '7% VAT', carrier: 'Kerry Logistics', prefix: 'INV',
  });
  const { toast } = useToast();

  // Mobile accordion state
  const [mobileOpenSection, setMobileOpenSection] = useState<Tab | null>('identity');
  const toggleMobileSection = (section: Tab) => {
    setMobileOpenSection(prev => prev === section ? null : section);
    setTab(section);
  };

  const save = () => toast('Settings saved successfully!', 'success');
  const discard = () => toast('Changes discarded.', 'info');
  const invite = () => {
    if (!inviteEmail) return;
    toast(`Invitation sent to ${inviteEmail}`, 'success');
    setShowInvite(false);
    setInviteEmail('');
  };

  const row = (label: string, value: string, icon: React.ElementType, color = 'var(--primary)') => ({
    label, value, icon, color,
  });

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--surface)', paddingBottom: '7rem' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>
            Platform Configuration
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--on-surface)', lineHeight: 1.1 }}>
          System Settings
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem', fontSize: '0.9375rem' }}>
          Manage workspace, preferences, and team access
        </p>
      </div>

      {/* ── TAB BAR ── */}
      <div className="hidden lg:block" style={{ display: 'flex', gap: '0.25rem', marginBottom: '2.5rem', backgroundColor: 'var(--surface-container-low)', padding: '0.25rem', borderRadius: 16 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600,
              transition: 'all 150ms',
              backgroundColor: tab === t.id ? 'var(--surface-container-lowest)' : 'transparent',
              color: tab === t.id ? 'var(--primary)' : 'var(--on-surface-variant)',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              whiteSpace: 'nowrap',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MOBILE SECTION ACCORDION ── */}
      <div className="lg:hidden space-y-2 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] px-1">Select Section</p>
        {TABS.map(t => {
          const icons: Record<string, any> = {
            identity: Award, general: Globe, financial: CreditCardIcon,
            notifications: Bell, users: ShieldCheck,
          };
          const Icon = icons[t.id];
          return (
            <button key={t.id}
              onClick={() => toggleMobileSection(t.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all touch-action text-left ${
                tab === t.id
                  ? 'border-[var(--primary)] bg-[var(--primary-container)]'
                  : 'border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] hover:border-[var(--outline)]'
              }`}>
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" style={{ color: tab === t.id ? 'var(--primary)' : 'var(--on-surface-variant)' }} />
                <span className={`font-semibold text-sm ${tab === t.id ? 'text-[var(--primary)]' : 'text-[var(--on-surface)]'}`}>
                  {t.label}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${mobileOpenSection === t.id ? 'rotate-90 text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`} />
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════
          IDENTITY
          ══════════════════════════════════════ */}
      {tab === 'identity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Workspace Identity */}
          <div style={{ width: '100%', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 20, border: '1px solid var(--outline-variant)', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award style={{ width: 22, height: 22, color: 'var(--primary)' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>Workspace Identity</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Global branding and logo</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <Field label="Company Name" value={general.companyName} onChange={v => setGeneral(g => ({ ...g, companyName: v }))} />
              <Field label="Workspace Slug" value={general.slug} onChange={v => setGeneral(g => ({ ...g, slug: v }))} prefix="morix.v2/" />
              <Field label="Primary Language" value={general.language} onChange={v => setGeneral(g => ({ ...g, language: v }))} type="select"
                options={['Thai (ประเทศไทย)', 'English (United States)']} />
              <Field label="Timezone" value={general.timezone} onChange={v => setGeneral(g => ({ ...g, timezone: v }))} type="select"
                options={['(GMT+07:00) Bangkok, Hanoi', '(GMT+00:00) UTC']} />
            </div>

            {/* Logo */}
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>Logo</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', border: '2px dashed var(--outline-variant)', borderRadius: 16, backgroundColor: 'var(--surface-container-low)' }}>
                <div style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.75rem' }}>M</span>
                </div>
                <div>
                  <button onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if(file) alert("Profile image upload: " + file.name); }; input.click(); }}
                    style={{ backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', padding: '0.5rem 1.5rem', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                    Replace Image
                  </button>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>PNG, SVG or WEBP · Max 2MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Supabase */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: 20, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -32, bottom: -32, width: 160, height: 160, borderRadius: '50%', backgroundColor: 'rgba(62,207,142,0.08)', filter: 'blur(40px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#3ecf8e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database style={{ width: 22, height: 22, color: 'white' }} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, color: 'white', fontSize: '1.125rem' }}>Supabase Cloud</h2>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>PostgreSQL Database · Real-time · Auth</p>
                  </div>
                </div>
                <span style={{ padding: '0.25rem 0.875rem', backgroundColor: 'rgba(62,207,142,0.15)', color: '#3ecf8e', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 9999, border: '1px solid rgba(62,207,142,0.3)' }}>
                  Connected
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.25rem' }}>Project ID</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#94a3b8' }}>ltciqzjcnlrkgbcdnegt</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.25rem' }}>API Key</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.5rem 0.75rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#64748b', flex: 1 }}>••••••••••••••••••••••••••••••••</span>
                    <button onClick={() => setShowApiKey(!showApiKey)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      <Eye style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.6875rem', color: '#475569' }}>Last sync 14 minutes ago · Region: Southeast Asia</p>
                <button style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3ecf8e', background: 'transparent', border: 'none', cursor: 'pointer' }}>Test Connection</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          GENERAL
          ══════════════════════════════════════ */}
      {tab === 'general' && (
        <div style={{ width: '100%', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 20, border: '1px solid var(--outline-variant)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe style={{ width: 22, height: 22, color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>General Settings</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Language, date format, and regional preferences</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <Field label="Primary Language" value={general.language} onChange={v => setGeneral(g => ({ ...g, language: v }))} type="select"
              options={['Thai (ประเทศไทย)', 'English (United States)', 'Chinese (中文)']} />
            <Field label="Timezone" value={general.timezone} onChange={v => setGeneral(g => ({ ...g, timezone: v }))} type="select"
              options={['(GMT+07:00) Bangkok, Hanoi, Jakarta', '(GMT+08:00) Singapore, Hong Kong', '(GMT+00:00) UTC']} />
            <Field label="Default Currency" value={general.currency} onChange={v => setGeneral(g => ({ ...g, currency: v }))} type="select"
              options={['Thai Baht (THB)', 'US Dollar (USD)', 'Chinese Yuan (CNY)']} />
            <Field label="Date Format" value={general.dateFormat} onChange={v => setGeneral(g => ({ ...g, dateFormat: v }))} type="select"
              options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          FINANCIAL
          ══════════════════════════════════════ */}
      {tab === 'financial' && (
        <div style={{ width: '100%', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 20, border: '1px solid var(--outline-variant)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCardIcon style={{ width: 22, height: 22, color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>Financial Defaults</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Currency, tax rate, and billing preferences</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {[
              { icon: CreditCardIcon, label: 'Default Currency',  value: financial.currency,  color: '#F97316' },
              { icon: Receipt,       label: 'Default Tax Rate',  value: financial.tax,       color: '#3B82F6' },
              { icon: Truck,         label: 'Shipping Carrier', value: financial.carrier,   color: '#7C3AED' },
              { icon: Globe,          label: 'Invoice Prefix',     value: financial.prefix,    color: '#059669' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderRadius: 16, backgroundColor: 'var(--surface-container-low)', cursor: 'pointer', transition: 'background 150ms' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.icon style={{ width: 20, height: 20, color: item.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>{item.label}</p>
                    <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--on-surface)', marginTop: 2 }}>{item.value}</p>
                  </div>
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: 'var(--on-surface-variant)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          NOTIFICATIONS
          ══════════════════════════════════════ */}
      {tab === 'notifications' && (
        <div style={{ width: '100%', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 20, border: '1px solid var(--outline-variant)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell style={{ width: 22, height: 22, color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>Notification Preferences</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Choose what to be notified about</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {NOTIFS.map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: 14, backgroundColor: 'var(--surface-container-low)', transition: 'background 150ms' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'var(--surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell style={{ width: 16, height: 16, color: 'var(--on-surface-variant)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{n.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{n.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifs(p => ({ ...p, [n.id]: !p[n.id] }))}
                  style={{
                    width: 48, height: 28, borderRadius: 9999, border: 'none', cursor: 'pointer',
                    transition: 'all 200ms',
                    background: notifs[n.id] ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--surface-container-high)',
                    boxShadow: notifs[n.id] ? '0 2px 8px rgba(249,115,22,0.3)' : 'none',
                    position: 'relative', flexShrink: 0,
                  }}>
                  <span style={{
                    position: 'absolute', top: 2, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'white',
                    transition: 'left 200ms',
                    left: notifs[n.id] ? 22 : 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          USERS
          ══════════════════════════════════════ */}
      {tab === 'users' && (
        <div style={{ width: '100%', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 20, border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck style={{ width: 22, height: 22, color: 'var(--primary)' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>User Access Control</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{teamMembers.length} team members</p>
              </div>
            </div>
            <button onClick={() => setShowInvite(true)}
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', padding: '0.625rem 1.5rem', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-body)', boxShadow: '0 2px 8px rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus style={{ width: 16, height: 16 }} />
              Invite User
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  {['Team Member', 'Role', 'Status', 'Last Active'].map((h, i) => (
                    <th key={i} style={{ padding: '0.875rem 2rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((m, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--outline-variant)' }}>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '0.875rem', flexShrink: 0 }}>
                          {m.initial}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>{m.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{
                          display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 9999, fontSize: '0.6875rem', fontWeight: 700,
                          backgroundColor: m.role === 'Admin' ? 'var(--primary-container)' : m.role === 'Editor' ? '#DBEAFE' : 'var(--surface-container-high)',
                          color: m.role === 'Admin' ? 'var(--primary-dark)' : m.role === 'Editor' ? '#1D4ED8' : 'var(--on-surface-variant)',
                        }}>
                          {m.role}
                        </span>
                        <div style={{ position: 'relative' }}>
                          <Info style={{ width: 14, height: 14, color: 'var(--outline)', cursor: 'help' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: m.status === 'active' ? 'var(--success)' : 'var(--on-surface-variant)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--on-surface)', textTransform: 'capitalize' }}>{m.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{m.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INVITE MODAL ── */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} onClick={() => setShowInvite(false)} />
          <div style={{ position: 'relative', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--on-surface)' }}>Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: 8, color: 'var(--on-surface-variant)' }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Email Address</p>
                <input style={{ backgroundColor: 'var(--surface-container-low)', border: '1px solid transparent', borderRadius: 12, padding: '0.75rem 1rem', width: '100%', fontSize: '0.875rem', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', outline: 'none' }}
                  type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              </div>
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Role</p>
                <select style={{ backgroundColor: 'var(--surface-container-low)', border: 'none', borderRadius: 12, padding: '0.75rem 1rem', width: '100%', fontSize: '0.875rem', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}
                  value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  {Object.entries(ROLE_DESC).map(([role, desc]) => (
                    <option key={role} value={role}>{role} — {desc}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowInvite(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 9999, border: '1.5px solid var(--outline)', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)', fontFamily: 'var(--font-body)' }}>Cancel</button>
              <button onClick={invite} style={{ flex: 1, padding: '0.75rem', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-body)', boxShadow: '0 2px 8px rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Plus style={{ width: 16, height: 16 }} />
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY SAVE BAR ── */}
      {/* Desktop: fixed bottom-right; Mobile: full-width bottom bar above bottom nav */}
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex gap-3 lg:flex-nowrap">
        <button onClick={discard} className="flex-1 lg:flex-none" style={{ padding: '0.75rem 1.5rem', borderRadius: 9999, border: '1.5px solid var(--outline-variant)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <X style={{ width: 16, height: 16 }} />
          Discard
        </button>
        <button onClick={save} className="flex-1 lg:flex-none" style={{ padding: '0.75rem 1.5rem', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}>
          <Save style={{ width: 16, height: 16 }} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ── Shared Field Component ──────────────────────────────────
function Field({
  label, value, onChange, type = 'text', options, prefix,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; options?: string[]; prefix?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>
        {label}
      </label>
      {type === 'select' ? (
        <div style={{ position: 'relative' }}>
          <select
            style={{ backgroundColor: 'var(--surface-container-low)', border: 'none', borderRadius: 12, padding: '0.75rem 2.5rem 0.75rem 1rem', width: '100%', fontSize: '0.875rem', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer', appearance: 'none' }}
            value={value} onChange={e => onChange(e.target.value)}>
            {(options || []).map(o => <option key={o}>{o}</option>)}
          </select>
          <ChevronRight style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-container-low)', borderRadius: 12, padding: '0 1rem', gap: '0.5rem' }}>
          {prefix && <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', flexShrink: 0 }}>{prefix}</span>}
          <input
            style={{ backgroundColor: 'transparent', border: 'none', padding: '0.75rem 0', width: '100%', fontSize: '0.875rem', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', outline: 'none' }}
            type={type} value={value} onChange={e => onChange(e.target.value)} />
        </div>
      )}
    </div>
  );
}
