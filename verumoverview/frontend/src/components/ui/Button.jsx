import React from 'react';
import { Loader2 } from 'lucide-react';
import designTokens from '../../constants/design-tokens';

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primaryDark focus:ring-primary dark:hover:bg-primaryDark',
  secondary:
    'bg-white text-primary border-2 border-primary hover:bg-primaryLight focus:ring-primary dark:bg-dark-card dark:text-white dark:border-primary dark:hover:bg-dark-background',
  disabled: 'bg-gray-light text-gray-medium cursor-not-allowed',
};

const SIZES = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-3 text-base',
  large: 'px-8 py-4 text-lg',
};

const Button = ({ variant = 'primary', size = 'medium', children, loading = false, disabled = false, className = '', ...props }) => {
  const isDisabled = disabled || loading || variant === 'disabled';
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.medium;

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 active:scale-95 ${variantStyles} ${sizeStyles} ${isDisabled ? VARIANTS.disabled : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Carregando...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
