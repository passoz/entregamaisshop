"use client"

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    async function initMsw() {
      console.log('MSW: Initializing...', process.env.NEXT_PUBLIC_API_MOCKING)
      if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && typeof window !== 'undefined') {
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

  if (!mswReady && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    return null
  }

  return <>{children}</>
}
