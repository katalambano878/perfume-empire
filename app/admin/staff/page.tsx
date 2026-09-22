'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/http-client';
import { STAFF_PERMISSIONS } from '@/lib/admin/commerce';

type StaffRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  preferences?: { permissions?: string[] };
  last_sign_in_at: string | null;
};

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  details: any;
  created_at: string;
  actor_email: string | null;
  actor_name: string | null;
  actor_role: string | null;
};

async function authHeader() {
  const { data: { session } } = await db.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [activity, setActivity] = useState<AuditRow[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['pos', 'orders']);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const headers = await authHeader();
    const [people, logs] = await Promise.all([
      fetch('/api/admin/staff', { headers }).then((res) => res.json()),
      fetch('/api/admin/audit', { headers }).then((res) => res.json()),
    ]);
    if (people.success) setStaff(people.data || []);
    else setError(people.error || 'Could not load staff');
    if (logs.success) setActivity(logs.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (id: string) => {
    setPermissions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const createStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers,
      body: JSON.stringify({ fullName, email, password, permissions }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setError(json.error || 'Could not add staff');
      return;
    }
    setFullName('');
    setEmail('');
    setPassword('');
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Staff and activity</h1>
        <p className="mt-1 text-sm text-neutral-500">Add counter staff, choose what they can open, and see what they do.</p>
      </div>

      <form onSubmit={createStaff} className="rounded-2xl border border-black/10 bg-white p-5 space-y-4">
        <h2 className="font-semibold">Add a staff login</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="border border-neutral-200 rounded-lg px-3 py-2" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="border border-neutral-200 rounded-lg px-3 py-2" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="border border-neutral-200 rounded-lg px-3 py-2" required minLength={6} />
        </div>
        <div className="flex flex-wrap gap-3">
          {STAFF_PERMISSIONS.map((item) => (
            <label key={item.id} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={permissions.includes(item.id)} onChange={() => toggle(item.id)} />
              {item.label}
            </label>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={saving} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? 'Saving...' : 'Add staff'}
        </button>
      </form>

      <div className="rounded-2xl border border-black/10 bg-white overflow-hidden">
        <h2 className="px-5 py-4 font-semibold border-b border-black/5">Who can sign in</h2>
        <div className="divide-y divide-black/5">
          {staff.map((person) => (
            <div key={person.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium">{person.full_name || person.email}</p>
                <p className="text-sm text-neutral-500">{person.email}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {(person.preferences?.permissions || []).join(', ') || (person.role === 'admin' ? 'Full access' : 'No extra permissions')}
                </p>
              </div>
              <div className="text-sm text-right">
                <span className="rounded-full bg-brand-muted px-2 py-1 text-xs font-semibold uppercase text-brand">{person.role}</span>
                <p className="mt-1 text-neutral-500">
                  Last sign in {person.last_sign_in_at ? new Date(person.last_sign_in_at).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white overflow-hidden">
        <h2 className="px-5 py-4 font-semibold border-b border-black/5">What they did</h2>
        <div className="divide-y divide-black/5">
          {activity.length === 0 && <p className="px-5 py-6 text-sm text-neutral-500">No activity yet.</p>}
          {activity.map((row) => (
            <div key={row.id} className="px-5 py-3 text-sm">
              <p className="font-medium">{row.actor_name || row.actor_email || 'Someone'} <span className="text-neutral-400 font-normal">· {row.actor_role}</span></p>
              <p className="text-neutral-600">{row.action.replace('.', ' ')} {row.details?.order_number ? `· ${row.details.order_number}` : ''}</p>
              <p className="text-xs text-neutral-400">{new Date(row.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
