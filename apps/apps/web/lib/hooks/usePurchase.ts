'use client';
import { useState, useCallback } from 'react';
import { contentApi } from '../api-client';
import { useAuth } from '../auth';

export function usePurchase() {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<'idle' | 'purchasing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const purchase = useCallback(async (docId: string) => {
    if (!accessToken) throw new Error('Not authenticated');
    setStatus('purchasing');
    setError(null);
    try {
      await contentApi.purchase(docId, accessToken);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }, [accessToken]);

  return { purchase, status, error };
}
