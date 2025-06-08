import React from 'react';
import { X, Check } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  placeholder = '',
  error,
  success,
  required = false,
  disabled = false,
  leftIcon,
  options = [],
  className = '',
  ...props
}) => {
  const baseStyles = `w-full border rounded-md py-2 px-3 placeholder-gray-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary`;
  const stateStyles = error
    ? 'border-status-error pr-10'
    : success
    ? 'border-status-success pr-10'
    : 'border-gray-border';
  const disabledStyles = disabled
    ? 'bg-gray-100 text-gray-medium cursor-not-allowed'
    : 'bg-white dark:bg-dark-background dark:text-white';
  const paddingLeft = leftIcon ? 'pl-10' : '';

  const inputClasses = `${baseStyles} ${stateStyles} ${disabledStyles} ${paddingLeft} ${className}`;

  const renderField = () => {
    if (type === 'textarea') {
      return <textarea className={inputClasses} placeholder={placeholder} disabled={disabled} {...props} />;
    }
    if (type === 'select') {
      return (
        <select className={inputClasses} disabled={disabled} {...props}>
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    return <input type={type} className={inputClasses} placeholder={placeholder} disabled={disabled} {...props} />;
  };

  return (
    <label className="block text-sm text-primary dark:text-white space-y-1">
      {label && (
        <span>
          {label} {required && <span className="text-status-error">*</span>}
        </span>
      )}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-medium">{leftIcon}</span>}
        {renderField()}
        {error && <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-status-error" />}
        {!error && success && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-status-success" />}
      </div>
      {error && <p className="text-status-error text-sm">{error}</p>}
      {success && !error && <p className="text-status-success text-sm">{success}</p>}
    </label>
  );
};

export default Input;
