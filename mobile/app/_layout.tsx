import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'
import { GradientBackground } from './components/GradientBackground'

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <GradientBackground>
        <Slot />
      </GradientBackground>
    </ClerkProvider>
  )
}
