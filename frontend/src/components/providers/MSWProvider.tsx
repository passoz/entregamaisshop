"use client"

import { useEffect } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function initMsw() {
      const isMockEnabledEnv = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled'
      const shouldMock = isMockEnabledEnv
      
      console.log('MSW: Initializing...', { shouldMock, isMockEnabledEnv })
      
      if (shouldMock && typeof window !== 'undefined') {
        process.env.NEXT_PUBLIC_MSW_ACTIVE = 'true'
        const { worker } = await import('@/mocks/browser')
        await worker.start({
          onUnhandledRequest: 'bypass',
        })
        console.log('MSW: Worker started!')
      }
    }

    initMsw()
  }, [])

  // During SSR we don't know if mocking is enabled via localStorage,
  // so we just render and let the client-side useEffect handle it.
  return <>{children}</>
}
