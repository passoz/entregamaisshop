"use client"

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    async function initMsw() {
      // Force mock to true to ensure it works inside the docker container
      const shouldMock = true 
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

  const shouldMock = true
  if (!mswReady && shouldMock) {
    return null
  }

  return <>{children}</>
}
