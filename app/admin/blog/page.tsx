'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/http-client';

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  created_at: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error: loadError } = await db
      .from('blog_posts')
      .select('id, title, slug, status, published_at, created_at')
      .order('created_at', { ascending: false });
    if (loadError) setError(loadError.message || 'Could not load posts');
    setPosts(data || []);
    setSelected([]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (ids: string[]) => {
    if (!ids.length || !confirm(`Delete ${ids.length} post${ids.length > 1 ? 's' : ''}?`)) return;
    setError('');
    for (const id of ids) {
      const { error: deleteError } = await db.from('blog_posts').delete().eq('id', id);
      if (deleteError) {
        setError(deleteError.message || 'Could not delete the post');
        return;
      }
    }
    setPosts((current) => current.filter((post) => !ids.includes(post.id)));
    setSelected([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Blog</h1>
        <p className="mt-1 text-sm text-neutral-500">Posts saved in the shop. Delete removes them for good.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => remove(selected)}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Delete {selected.length}
        </button>
      )}
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        {loading ? (
          <p className="px-5 py-8 text-sm text-neutral-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-500">No posts yet. The old sample titles were not saved, so there is nothing to delete.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-neutral-500">
                <th className="px-4 py-3" />
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-black/5">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(post.id)}
                      onChange={() =>
                        setSelected((current) =>
                          current.includes(post.id) ? current.filter((id) => id !== post.id) : [...current, post.id]
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3 capitalize">{post.status}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove([post.id])} className="text-red-600 font-semibold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
