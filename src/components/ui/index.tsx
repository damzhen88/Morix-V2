// Reusable UI Components for MORIX CRM v2

'use client';

import React from 'react';

// =======================
// BUTTON
// =======================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
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
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-sm hover:shadow-md',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current\" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// =======================
// CARD
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
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}

// =======================
// INPUT
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-gray-400">{helperText}</p>}
    </div>
  );
}

// =======================
// SELECT
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
        } ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// =======================
// BADGE
// =======================

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// =======================
// TABLE
// =======================

export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-100 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50/50">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>;
}

export function TableRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tr className={`hover:bg-gray-50/50 transition-colors ${className}`}>{children}</tr>;
}

export function TableHeadCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}>{children}</td>;
}

// =======================
// MODAL
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
    sm: 'max-w-full sm:max-w-md px-4',
    md: 'max-w-full sm:max-w-lg px-4',
    lg: 'max-w-full sm:max-w-2xl px-4',
    xl: 'max-w-full sm:max-w-4xl px-4',
    full: 'max-w-full px-2 sm:px-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        />
        
        {/* Modal */}
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =======================
// TABS
// =======================

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="border-b border-gray-100">
      <nav className="flex space-x-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
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
      <svg className={`animate-spin ${sizes[size]} text-orange-500`} fill="none" viewBox="0 0 24 24">
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
        <p className="mt-4 text-sm text-gray-500">กำลังโหลด...</p>
      </div>
    </div>
  );
}
