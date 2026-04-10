"use client"

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    async function initMsw() {
      // Disable mock to use real backend
      const shouldMock = false 
      console.log('MSW: Initializing...', { shouldMock })
      
      if (shouldMock && typeof window !== 'undefined') {
        process.env.NEXT_PUBLIC_MSW_ACTIVE = 'true'
        const { worker } = await import('@/mocks/browser')
        await worker.start({
          onUnhandledRequest: 'bypass',
        })
        console.log('MSW: Worker started!')
      }
      setMswReady(true)
    }

    initMsw()
  }, [])

  const shouldMock = false
  if (!mswReady && shouldMock) {
    return null
  }

  return <>{children}</>
}
