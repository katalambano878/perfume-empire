'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/http-client';
import { channelLabel, orderChannel } from '@/lib/admin/commerce';

type Summary = {
  orderCount: number;
  total: number;
  pos: number;
  online: number;
  byMethod: Record<string, number>;
  bySeller: Record<string, number>;
};

export default function EndOfDayPage() {
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Accra' }));
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [close, setClose] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async (day = date) => {
    const { data: { session } } = await db.auth.getSession();
    const res = await fetch(`/api/admin/day-close?date=${day}`, {
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error || 'Could not load the day');
      return;
    }
    setSummary(json.data.summary);
    setOrders(json.data.orders || []);
    setClose(json.data.close);
    setNotes(json.data.close?.notes || '');
    setError('');
  };

  useEffect(() => {
    load(date);
  }, [date]);

  const closeDay = async () => {
    setSaving(true);
    const { data: { session } } = await db.auth.getSession();
    const res = await fetch('/api/admin/day-close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ date, notes, summary }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setError(json.error || 'Could not close the day');
      return;
    }
    load(date);
  };

  const money = (value: number) => `GH₵${Number(value || 0).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">End of day</h1>
          <p className="mt-1 text-sm text-neutral-500">Paid sales for the shop day, split between the counter and the website.</p>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Paid orders', summary?.orderCount || 0],
          ['Total', money(summary?.total || 0)],
          ['Shop counter', money(summary?.pos || 0)],
          ['Online', money(summary?.online || 0)],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold mb-3">By payment</h2>
          {Object.entries(summary?.byMethod || {}).map(([method, total]) => (
            <p key={method} className="flex justify-between text-sm py-1"><span className="capitalize">{method}</span><span>{money(total)}</span></p>
          ))}
          {!Object.keys(summary?.byMethod || {}).length && <p className="text-sm text-neutral-500">No paid sales.</p>}
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold mb-3">By person</h2>
          {Object.entries(summary?.bySeller || {}).map(([name, total]) => (
            <p key={name} className="flex justify-between text-sm py-1"><span>{name}</span><span>{money(total)}</span></p>
          ))}
          {!Object.keys(summary?.bySeller || {}).length && <p className="text-sm text-neutral-500">No paid sales.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white overflow-hidden">
        <h2 className="px-5 py-4 font-semibold border-b border-black/5">Orders</h2>
        <div className="divide-y divide-black/5">
          {orders.map((order) => (
            <div key={order.id} className="px-5 py-3 flex justify-between text-sm">
              <span>{order.order_number} · {channelLabel(orderChannel(order))}</span>
              <span>{money(order.total)}</span>
            </div>
          ))}
          {orders.length === 0 && <p className="px-5 py-6 text-sm text-neutral-500">Nothing paid on this day.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-5 space-y-3">
        <h2 className="font-semibold">{close ? 'Day already closed' : 'Close this day'}</h2>
        {close && <p className="text-sm text-neutral-500">Closed {new Date(close.closed_at).toLocaleString()}</p>}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for the close, cash counted, anything short" className="w-full border border-neutral-200 rounded-lg px-3 py-2 min-h-24" />
        <button onClick={closeDay} disabled={saving} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? 'Saving...' : close ? 'Update close' : 'Close the day'}
        </button>
      </div>
    </div>
  );
}
