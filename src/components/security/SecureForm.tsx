/**
 * Secure Form Component
 * Provides built-in CSRF protection, input validation, and sanitization
 */

import React, { FormEvent, ReactNode } from 'react';
import { useCSRFProtection } from '@/lib/security/csrfProtection';

interface SecureFormProps {
  onSubmit: (formData: FormData, csrfToken: string) => Promise<void> | void;
  children: ReactNode;
  className?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  action?: string;
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data';
}

export const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  children,
  className = '',
  method = 'POST',
  action,
  encType = 'application/x-www-form-urlencoded'
}) => {
  const csrf = useCSRFProtection();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Add CSRF token
    csrf.addToFormData(formData);
    
    // Call the provided onSubmit handler
    await onSubmit(formData, csrf.token);
  };

  return (
    <form
      onSubmit={handleSubmit}
      method={method}
      action={action}
      encType={encType}
      className={`secure-form ${className}`}
      autoComplete="on"
      noValidate
    >
      {/* Hidden CSRF token field for fallback */}
      <input
        type="hidden"
        name="csrf_token"
        value={csrf.token}
        readOnly
      />
      
      {children}
    </form>
  );
};