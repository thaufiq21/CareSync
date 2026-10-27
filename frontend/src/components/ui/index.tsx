import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  return twMerge(clsx(inputs));
}

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', isLoading, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500',
    secondary: 'bg-navy-500 text-white hover:bg-navy-700 focus:ring-navy-500',
    outline: 'border-2 border-teal-500 text-teal-600 hover:bg-teal-50 focus:ring-teal-500',
    ghost: 'text-text-secondary hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-text-primary placeholder:text-gray-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400',
            className,
          )}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={!!error}
          {...props}
        />
        {hint && !error && <p id={`${inputId}-hint`} className="text-xs text-text-secondary">{hint}</p>}
        {error && <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600 flex items-center gap-1">
          <span aria-hidden="true">⚠</span> {error}
        </p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-text-primary placeholder:text-gray-400 resize-y min-h-[100px] transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400',
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p role="alert" className="text-xs text-red-600 flex items-center gap-1"><span aria-hidden="true">⚠</span> {error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-text-primary bg-white transition-colors appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
            error ? 'border-red-400' : 'border-gray-300 hover:border-gray-400',
            className,
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p role="alert" className="text-xs text-red-600 flex items-center gap-1"><span aria-hidden="true">⚠</span> {error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// Card
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white rounded-2xl shadow-card border border-gray-100 p-6', className)} {...props}>
      {children}
    </div>
  );
}

// Badge
interface BadgeProps {
  label: string;
  color?: 'teal' | 'navy' | 'yellow' | 'green' | 'red' | 'gray' | 'blue';
}

export function Badge({ label, color = 'gray' }: BadgeProps) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    navy: 'bg-navy-50 text-navy-500 border-navy-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', colors[color])}>
      {label}
    </span>
  );
}

// Loading skeleton
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded-xl', className)} />;
}

// Empty state
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      {icon && <div className="text-gray-300 mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// Status badge for requests
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: BadgeProps['color'] }> = {
    submitted: { label: 'Submitted', color: 'blue' },
    acknowledged: { label: 'Acknowledged', color: 'yellow' },
    in_progress: { label: 'In Progress', color: 'teal' },
    awaiting_patient: { label: 'Awaiting Patient', color: 'navy' },
    resolved: { label: 'Resolved', color: 'green' },
    closed: { label: 'Closed', color: 'gray' },
  };
  const { label, color } = map[status] ?? { label: status, color: 'gray' as const };
  return <Badge label={label} color={color} />;
}

// Star rating display
export function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={cn('w-4 h-4', i < value ? 'text-yellow-400' : 'text-gray-200')} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Alert
interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
  className?: string;
}

export function Alert({ type, children, className }: AlertProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  return (
    <div role="alert" className={cn('border rounded-xl px-4 py-3 text-sm flex items-start gap-2', styles[type], className)}>
      {children}
    </div>
  );
}

// Loading spinner
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex items-center justify-center p-4">
      <svg className={cn('animate-spin text-teal-500', sizes[size])} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

// Checkbox
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, error, className, id, ...props }, ref) {
    const inputId = id || `cb-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={cn('mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500', className)}
          {...props}
        />
        <div>
          <label htmlFor={inputId} className={cn('text-sm', error ? 'text-red-700' : 'text-text-primary')}>
            {label}
          </label>
          {error && <p role="alert" className="text-xs text-red-600 mt-0.5">{error}</p>}
        </div>
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';
