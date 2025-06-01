import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { SignOutButton } from '@/app/components/SignOutButton'
import { Ionicons } from '@expo/vector-icons'
import { GradientBackground } from '@/app/components/GradientBackground'

export default function Page() {
  const { user } = useUser()

  return (
    <GradientBackground>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>NameTag</Text>
          <Text style={styles.subtitle}>Your Smart Contact Manager</Text>
        </View>

        <SignedIn>
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userEmail}>{user?.emailAddresses[0].emailAddress}</Text>
            <Text style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4ade80" /> Logged In
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Link href="/contacts" asChild>
              <TouchableOpacity style={styles.primaryButton}>
                <Ionicons name="people" size={24} color="#fff" />
                <Text style={styles.buttonText}>View Contacts</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <SignOutButton />
        </SignedIn>

        <SignedOut>
          {/* Welcome Section for Signed Out Users */}
          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="book" size={80} color="#fff" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to ContactBook</Text>
            <Text style={styles.welcomeDescription}>
              Organize, sync, and manage all your contacts in one place
            </Text>
          </View>

          {/* Auth Buttons */}
          <View style={styles.authButtonsContainer}>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity style={styles.signInButton}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>Create Account</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Status for signed out */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              <Ionicons name="information-circle" size={16} color="#fff" /> Not logged in
            </Text>
          </View>
        </SignedOut>
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e9d5ff',
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  statusBadge: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  actionContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '600',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#e9d5ff',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  authButtonsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    color: '#e9d5ff',
    fontSize: 14,
  },
})