// Reusable UI Components for MORIX CRM v2 - The Digital Curator Edition
// Design System: "The Digital Curator" - Executive Editorial Experience

'use client';

import React from 'react';

// =======================
// BUTTON - Rounded Full, Signature Gradient
// =======================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  disabled,
  loading,
  type = 'button',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'gradient-signature text-white hover:gradient-signature-hover focus:ring-primary/30',
    secondary: 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] focus:ring-secondary/30 border-none',
    tertiary: 'bg-transparent text-[var(--color-primary)] hover:bg-primary/5 focus:ring-primary/30 border-none',
    danger: 'bg-[var(--color-error-container)] text-[var(--color-error)] hover:bg-[var(--color-error-container)]/80 focus:ring-error/30',
    ghost: 'bg-transparent text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] focus:ring-secondary/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// =======================
// CARD - XL Corner Radius, No Dividers
// =======================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div className={`card-elevated ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}

// =======================
// INPUT - Surface Container Lowest, No Border
// =======================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="input-label">
          {label}
          {props.required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}
      <input
        className={`input-field w-full ${error ? 'shadow-[inset_0_0_0_2px_var(--color-error)]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-[var(--color-on-surface-variant)]">{helperText}</p>}
    </div>
  );
}

// =======================
// SELECT - Same as Input
// =======================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="input-label">
          {label}
          {props.required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}
      <select
        className={`input-field w-full cursor-pointer ${error ? 'shadow-[inset_0_0_0_2px_var(--color-error)]' : ''} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

// =======================
// TEXTAREA
// =======================

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="input-label">
          {label}
          {props.required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`input-field w-full min-h-[100px] resize-y ${error ? 'shadow-[inset_0_0_0_2px_var(--color-error)]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

// =======================
// BADGE - Rounded Full
// =======================

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]',
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-error',
    info: 'bg-blue-50 text-blue-700',
  };
  
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// =======================
// TABLE - No Dividers, Background Shifts
// =======================

export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-[var(--color-surface)]">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-[var(--color-surface-container-low)]">{children}</tbody>;
}

export function TableRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tr className={`hover:bg-[var(--color-surface-container-low)] transition-colors ${className}`}>{children}</tr>;
}

export function TableHeadCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-6 py-4 text-left text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 whitespace-nowrap text-sm text-[var(--color-on-surface)] ${className}`}>{children}</td>;
}

// =======================
// MODAL - Glass Effect
// =======================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-full sm:max-w-md',
    md: 'max-w-full sm:max-w-lg',
    lg: 'max-w-full sm:max-w-2xl',
    xl: 'max-w-full sm:max-w-4xl',
    full: 'max-w-full',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop - Glass Effect */}
        <div 
          className="fixed inset-0 bg-[var(--color-on-surface)]/20 backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        />
        
        {/* Modal - Elevated Surface with Glass */}
        <div className={`relative glass shadow-elevation-5 w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-scale-in`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-surface-container-low)]">
            <h3 className="text-title-md text-[var(--color-on-surface)]">{title}</h3>
            <button 
              onClick={onClose} 
              className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-[var(--color-surface-container-low)] bg-[var(--color-surface-container-low)]/50 rounded-b-[1.5rem]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =======================
// TABS - No Line, Background Shift
// =======================

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="bg-[var(--color-surface-container-low)] rounded-[1rem] p-1">
      <nav className="flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 relative py-2.5 px-4 text-sm font-medium transition-all duration-200 rounded-[0.75rem] ${
              activeTab === tab.id
                ? 'bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id 
                  ? 'bg-[var(--color-primary-container)] text-white' 
                  : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

// =======================
// EMPTY STATE
// =======================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-[var(--color-outline)]">{icon}</div>}
      <h3 className="text-title-md text-[var(--color-on-surface)] mb-2">{title}</h3>
      {description && <p className="text-body-md text-[var(--color-on-surface-variant)] mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// =======================
// LOADING SPINNER
// =======================

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className="flex items-center justify-center">
      <svg className={`animate-spin ${sizes[size]} text-[var(--color-primary)]`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
}

// =======================
// PAGE LOADER
// =======================

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-body-md text-[var(--color-on-surface-variant)]">กำลังโหลด...</p>
      </div>
    </div>
  );
}

// =======================
// SKELETON LOADER
// =======================

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--color-surface-container-high)] rounded-full ${className}`} />
  );
}