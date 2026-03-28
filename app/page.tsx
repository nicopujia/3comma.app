'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Onboarding } from '@/components/onboarding'

export default function Home() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const router = useRouter()

  useEffect(() => {
    if (onboardingComplete) {
      router.replace('/home')
    }
  }, [onboardingComplete, router])

  if (onboardingComplete) return null
  return <Onboarding />
}
