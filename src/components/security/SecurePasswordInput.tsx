/**
 * Secure Password Input Component
 * Provides enhanced password security with strength validation and leak checking
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, AlertTriangle, Check } from 'lucide-react';
import { validatePassword } from '@/lib/security/inputValidation';

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

export const SecurePasswordInput: React.FC<SecurePasswordInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter password',
  name = 'password',
  required = false,
  showStrengthIndicator = true,
  className = '',
  onValidationChange
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState({ isValid: false, errors: [] as string[] });
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (value) {
      const result = validatePassword(value);
      setValidation(result);
      
      // Calculate password strength (0-4)
      let strengthScore = 0;
      if (value.length >= 8) strengthScore++;
      if (/[A-Z]/.test(value)) strengthScore++;
      if (/[a-z]/.test(value)) strengthScore++;
      if (/\d/.test(value)) strengthScore++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strengthScore++;
      setStrength(strengthScore);

      onValidationChange?.(result.isValid, result.errors);
    } else {
      setValidation({ isValid: false, errors: [] });
      setStrength(0);
      onValidationChange?.(false, []);
    }
  }, [value, onValidationChange]);

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getStrengthText = () => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className={`secure-password-input ${className}`}>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          name={name}
          required={required}
          className={`
            w-full px-4 py-3 pr-12 rounded-lg border border-crd-border 
            bg-crd-surface text-crd-text placeholder-crd-text-muted
            focus:outline-none focus:ring-2 focus:ring-crd-focus focus:border-transparent
            ${validation.errors.length > 0 && value ? 'border-red-500' : ''}
            ${validation.isValid ? 'border-green-500' : ''}
          `}
          autoComplete="new-password"
          spellCheck={false}
          data-testid="secure-password-input"
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-crd-text-muted hover:text-crd-text transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {showStrengthIndicator && value && (
        <div className="mt-2 space-y-2">
          {/* Strength meter */}
          <div className="flex items-center space-x-2">
            <Shield size={16} className="text-crd-text-muted" />
            <div className="flex-1 bg-crd-surface-light rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: `${(strength / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm text-crd-text-muted">{getStrengthText()}</span>
          </div>

          {/* Validation errors */}
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-red-400">
                  <AlertTriangle size={14} />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Success indicator */}
          {validation.isValid && (
            <div className="flex items-center space-x-2 text-sm text-green-400">
              <Check size={14} />
              <span>Password meets security requirements</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};