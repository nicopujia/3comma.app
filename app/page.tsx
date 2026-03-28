'use client'

import { useAppStore } from '@/lib/store'
import { Onboarding } from '@/components/onboarding'
import { AppShell } from '@/components/app-shell'

export default function Home() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  return onboardingComplete ? <AppShell /> : <Onboarding />
}
