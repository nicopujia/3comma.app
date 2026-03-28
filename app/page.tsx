'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Onboarding } from '@/components/onboarding'

export default function Home() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated && onboardingComplete) {
      router.replace('/home')
    }
  }, [hydrated, onboardingComplete, router])

  // Wait for store to rehydrate before deciding what to show
  if (!hydrated) return null
  if (onboardingComplete) return null
  return <Onboarding />
}
