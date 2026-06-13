'use client';
import { useState, useEffect, useCallback } from 'react';
import { contentApi, Document } from '../api-client';

interface Filters { search?: string; university?: string; docType?: string; }

export function useDocuments(filters: Filters = {}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromBackend, setFromBackend] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contentApi.list(filters);
      setDocuments(data);
      setFromBackend(true);
    } catch (err: any) {
      setError(err.message);
      setFromBackend(false);
    } finally {
      setIsLoading(false);
    }
  }, [filters.search, filters.university, filters.docType]);

  // FIXED: Debounce implementation to prevent spamming backend on every keystroke
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetch();
    }, 300); // Wait 300ms after last typing event before fetching
    
    return () => clearTimeout(timeoutId);
  }, [fetch]);

  return { documents, isLoading, error, fromBackend, refetch: fetch };
}