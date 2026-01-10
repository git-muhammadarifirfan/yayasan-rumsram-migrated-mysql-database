type Json = Record<string, any>;

export async function fetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // cookies for auth
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as Json) : ({} as Json);

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}
