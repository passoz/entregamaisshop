import { getBrowserSession } from "@/lib/auth/browser";

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  let token: string | undefined;
  
  try {
    if (typeof window !== "undefined") {
      const session = await getBrowserSession();
      token = session?.accessToken;
    }
  } catch (e) {
    // Fail silently - if token is needed, the backend will return 401
  }

  const headers = new Headers(options.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const json = await res.json();

  if ("success" in json) {
    const typedJson = json as APIResponse<T>;

    if (!res.ok || !typedJson.success) {
      throw new Error(typedJson.error?.message || "API Request failed");
    }

    return typedJson.data;
  }

  if (!res.ok) {
    throw new Error("API Request failed");
  }

  return json as T;
}
