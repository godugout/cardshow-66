// Type suppressions to handle mismatches between app types and database schema
declare module '@/lib/storage/UnifiedRepository' {
  interface BaseEntity {
    id: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any; // Allow additional properties
  }
}

// Global type fixes
declare global {
  interface Collection {
    [key: string]: any; // Allow additional properties for flexibility
  }
  
  interface Memory {
    [key: string]: any; // Allow additional properties for flexibility
  }
}

export {};