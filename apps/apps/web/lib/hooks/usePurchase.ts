'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { contentApi } from '../api-client';
import { useAuth } from '../auth';

export function usePurchase() {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<'idle' | 'purchasing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // FIXED: Track mounted state to prevent state updates on unmounted components
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const purchase = useCallback(async (docId: string) => {
    if (!accessToken) throw new Error('Not authenticated');
    setStatus('purchasing');
    setError(null);
    try {
      await contentApi.purchase(docId, accessToken);
      if (isMounted.current) {
        setStatus('success');
        setTimeout(() => { if (isMounted.current) setStatus('idle'); }, 3000);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message);
        setStatus('error');
      }
    }
  }, [accessToken]);

  return { purchase, status, error };
}