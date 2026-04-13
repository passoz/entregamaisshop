export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 1. LocalStorage Polyfill for SSR
    if (typeof global.localStorage === 'undefined' || typeof (global as any).localStorage?.getItem !== 'function') {
      (global as any).localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      };
    }

    // 2. MSW Server-side initialization
    if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
      const { server } = await import('@/mocks/server');
      server.listen({ onUnhandledRequest: 'bypass' });
      console.log('MSW: Server-side worker started!');
    }
  }
}

export function onRequestError(error: unknown) {
  console.error("Request error:", error)
}
