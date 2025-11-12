export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/$/, "");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("nexus_token");
  } catch {
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function withAuth(init?: RequestInit): RequestInit {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
    ...getAuthHeaders(),
  };
  return { ...init, headers };
}

