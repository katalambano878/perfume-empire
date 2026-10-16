'use client';

import { db } from '@/lib/db/http-client';

export async function adminFetch<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const { data: { session } } = await db.auth.getSession();
  const headers = new Headers(init.headers);
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(url, { ...init, headers, credentials: 'include', cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || json?.message || `Request failed (${res.status})`);
  return json as T;
}

export function cedis(n: number | null | undefined): string {
  const value = Number(n) || 0;
  return `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
