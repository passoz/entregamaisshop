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

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json: APIResponse<T> = await res.json();
  
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || "API Request failed");
  }
  
  return json.data;
}
