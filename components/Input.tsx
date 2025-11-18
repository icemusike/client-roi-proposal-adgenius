import React from 'react';

interface InputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'number' | 'url';
  placeholder?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  className = '',
  prefix,
  suffix,
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative rounded-lg shadow-sm">
        {prefix && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <span className="text-slate-400 sm:text-sm font-medium">{prefix}</span>
            </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 sm:text-sm smooth-transition font-medium text-slate-700 ${prefix ? 'pl-8' : 'pl-3.5'} ${suffix ? 'pr-10' : 'pr-3.5'} py-2.5`}
        />
        {suffix && (
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                <span className="text-slate-400 sm:text-sm font-medium">{suffix}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default Input;
