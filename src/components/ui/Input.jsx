import React from 'react';

export default function Input({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm transition-all focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="text-[11px] text-red-500 font-semibold">{error}</p>
      )}
    </div>
  );
}
