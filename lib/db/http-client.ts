import { clearAuthCookies, setAuthCookies } from "@/lib/auth-cookie";

type QueryResult<T = any> = { data: T; error: { message: string } | null; count: number | null };

const SESSION_KEY = "pe-auth-session";
type AuthListener = (event: string, session: Session | null) => void;
const listeners = new Set<AuthListener>();

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: any;
}

function origin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");
}

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function persistSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    clearAuthCookies();
    listeners.forEach((fn) => fn("SIGNED_OUT", null));
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setAuthCookies(session.access_token, session.refresh_token);
  listeners.forEach((fn) => fn("SIGNED_IN", session));
}

function authHeader(): HeadersInit {
  const session = loadSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  return headers;
}

class HttpQuery {
  private table: string;
  private method: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private columns = "*";
  private params = new URLSearchParams();
  private body: unknown = null;
  private single = false;
  private maybe = false;
  private countExact = false;
  private upsert = false;
  private onConflict?: string;

  constructor(table: string) {
    this.table = table;
  }

  select(cols = "*", opts?: { count?: string; head?: boolean }) {
    this.columns = cols || "*";
    if (opts?.count === "exact") this.countExact = true;
    return this;
  }

  insert(row: unknown) {
    this.method = "POST";
    this.body = row;
    return this;
  }

  update(patch: unknown) {
    this.method = "PATCH";
    this.body = patch;
    return this;
  }

  upsert(row: unknown, opts?: { onConflict?: string }) {
    this.method = "POST";
    this.body = row;
    this.upsert = true;
    this.onConflict = opts?.onConflict;
    return this;
  }

  delete() {
    this.method = "DELETE";
    return this;
  }

  eq(col: string, value: any) {
    this.params.append(col, `eq.${value}`);
    return this;
  }
  neq(col: string, value: any) {
    this.params.append(col, `neq.${value}`);
    return this;
  }
  gt(col: string, value: any) {
    this.params.append(col, `gt.${value}`);
    return this;
  }
  gte(col: string, value: any) {
    this.params.append(col, `gte.${value}`);
    return this;
  }
  lt(col: string, value: any) {
    this.params.append(col, `lt.${value}`);
    return this;
  }
  lte(col: string, value: any) {
    this.params.append(col, `lte.${value}`);
    return this;
  }
  ilike(col: string, value: any) {
    this.params.append(col, `ilike.${value}`);
    return this;
  }
  like(col: string, value: any) {
    this.params.append(col, `like.${value}`);
    return this;
  }
  is(col: string, value: any) {
    this.params.append(col, `is.${value === null ? "null" : value}`);
    return this;
  }
  in(col: string, values: any[]) {
    this.params.append(col, `in.(${values.join(",")})`);
    return this;
  }
  or(expr: string) {
    this.params.append("or", `(${expr})`);
    return this;
  }
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    const dir = opts?.ascending === false ? "desc" : "asc";
    const nulls = opts?.nullsFirst ? ".nullsfirst" : "";
    const prev = this.params.get("order");
    const next = `${col}.${dir}${nulls}`;
    this.params.set("order", prev ? `${prev},${next}` : next);
    return this;
  }
  limit(n: number) {
    this.params.set("limit", String(n));
    return this;
  }
  range(from: number, to: number) {
    this.params.set("offset", String(from));
    this.params.set("limit", String(to - from + 1));
    return this;
  }
  single() {
    this.single = true;
    return this;
  }
  maybeSingle() {
    this.maybe = true;
    this.single = true;
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<QueryResult> {
    const params = new URLSearchParams(this.params);
    if (this.method === "GET" || params.has("select") === false) {
      params.set("select", this.columns);
    }
    if (this.onConflict) params.set("on_conflict", this.onConflict);

    const headers: Record<string, string> = { ...authHeader() };
    const prefer: string[] = [];
    if (this.method !== "GET") prefer.push("return=representation");
    if (this.countExact) prefer.push("count=exact");
    if (this.upsert) prefer.push("resolution=merge-duplicates");
    if (prefer.length) headers.Prefer = prefer.join(",");
    if (this.single) headers.Accept = "application/vnd.pgrst.object+json";

    const url = `${origin()}/rest/v1/${this.table}?${params.toString()}`;
    const res = await fetch(url, {
      method: this.method,
      headers,
      body: this.method === "GET" ? undefined : JSON.stringify(this.body),
    });

    const contentRange = res.headers.get("content-range");
    const count = contentRange?.includes("/")
      ? Number(contentRange.split("/")[1])
      : null;

    let payload: any = null;
    const text = await res.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { message: text };
      }
    }

    if (!res.ok) {
      const message =
        payload?.message || payload?.error_description || payload?.msg || res.statusText;
      if (this.maybe && res.status === 406) {
        return { data: null, error: null, count };
      }
      return { data: null, error: { message }, count };
    }

    if (this.single && Array.isArray(payload)) {
      payload = payload[0] ?? null;
      if (!payload && !this.maybe) {
        return { data: null, error: { message: "No rows" }, count };
      }
    }

    return { data: payload ?? null, error: null, count: Number.isFinite(count) ? count : null };
  }
}

async function authRequest(path: string, init?: RequestInit) {
  const res = await fetch(`${origin()}/auth/v1/${path}`, {
    ...init,
    headers: { ...authHeader(), ...(init?.headers || {}) },
  });
  const text = await res.text();
  let json: any = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }
  if (!res.ok) {
    return {
      data: { session: null, user: null },
      error: { message: json.message || json.error_description || json.msg || res.statusText },
    };
  }
  return { data: json, error: null };
}

function sessionFromAuthPayload(payload: any): Session | null {
  if (!payload?.access_token) return null;
  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_in: payload.expires_in,
    expires_at: payload.expires_at,
    token_type: payload.token_type || "bearer",
    user: payload.user,
  };
}

export const db = {
  from(table: string) {
    return new HttpQuery(table);
  },
  rpc(fn: string, args: Record<string, any> = {}) {
    return fetch(`${origin()}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(args),
    }).then(async (res) => {
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return { data: null, error: { message: json?.message || res.statusText } };
      }
      return { data: json, error: null };
    });
  },
  storage: {
    from(bucket: string) {
      return {
        async upload(objectPath: string, file: File | Blob | ArrayBuffer, opts?: { contentType?: string; upsert?: boolean }) {
          const headers: Record<string, string> = { ...authHeader() };
          delete headers["Content-Type"];
          headers["Content-Type"] =
            opts?.contentType ||
            (file instanceof File ? file.type : "application/octet-stream");
          if (opts?.upsert) headers["x-upsert"] = "true";
          const res = await fetch(
            `${origin()}/storage/v1/object/${bucket}/${objectPath.replace(/^\/+/, "")}`,
            { method: "POST", headers, body: file as BodyInit }
          );
          const json = await res.json().catch(() => ({}));
          if (!res.ok) return { data: null, error: { message: json.error || res.statusText } };
          return { data: { path: objectPath }, error: null };
        },
        getPublicUrl(objectPath: string) {
          const clean = objectPath.replace(/^\/+/, "");
          return {
            data: {
              publicUrl: `${origin()}/storage/v1/object/public/${bucket}/${encodeURI(clean)}`,
            },
          };
        },
      };
    },
  },
  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const result = await authRequest(`token?grant_type=password`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (result.error) return { data: { session: null, user: null }, error: result.error };
      const session = sessionFromAuthPayload(result.data);
      if (session) persistSession(session);
      return { data: { session, user: session?.user ?? null }, error: null };
    },
    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) {
      const result = await authRequest("signup", {
        method: "POST",
        body: JSON.stringify({ email, password, data: options?.data || {} }),
      });
      if (result.error) return { data: { session: null, user: null }, error: result.error };
      const session = sessionFromAuthPayload(result.data);
      if (session) persistSession(session);
      return { data: { session, user: session?.user ?? null }, error: null };
    },
    async signOut() {
      await authRequest("logout", { method: "POST" });
      persistSession(null);
      return { error: null };
    },
    async getSession() {
      return { data: { session: loadSession() }, error: null };
    },
    async getUser(token?: string) {
      const access = token || loadSession()?.access_token;
      if (!access) return { data: { user: null }, error: { message: "No session" } };
      const result = await authRequest("user", {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (result.error) return { data: { user: null }, error: result.error };
      return { data: { user: result.data }, error: null };
    },
    async updateUser(attrs: { password?: string; data?: Record<string, unknown> }) {
      const result = await authRequest("user", {
        method: "PUT",
        body: JSON.stringify(attrs),
      });
      if (result.error) return { data: { user: null }, error: result.error };
      const session = loadSession();
      if (session) {
        session.user = result.data;
        persistSession(session);
      }
      return { data: { user: result.data }, error: null };
    },
    onAuthStateChange(callback: AuthListener) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              listeners.delete(callback);
            },
          },
        },
      };
    },
  },
};

export type StoreClient = typeof db;
