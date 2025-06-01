import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useUser, useOAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';

/**
 * SettingsScreen displays user profile and allows linking/unlinking social accounts via Clerk OAuth.
 */
export default function SettingsScreen() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Map provider display names to Clerk OAuth strategy keys
  const providerToStrategy: Record<string, string> = {
    Google: 'oauth_google',
    Apple: 'oauth_apple',
    Facebook: 'oauth_facebook',
    Twitter: 'oauth_twitter',
    LinkedIn: 'oauth_linkedin',
    WhatsApp: 'oauth_whatsapp',
  };

  // Use Clerk's OAuth hook
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  /**
   * Initiates Clerk OAuth flow for the given provider.
   * On success, sets the session and navigates back to settings.
   */
  const handleLinkAccount = async (provider: string) => {
    const strategy = providerToStrategy[provider];
    if (!strategy) {
      Alert.alert('Error', `No OAuth strategy found for ${provider}.`);
      return;
    }

    try {
      const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // Optionally show a success message
        // Alert.alert('Success', `${provider} account linked!`);
        // Refresh the screen or navigate back
        router.replace('/settings');
      } else {
        // If no session, but signIn or signUp returned, handle accordingly
        Alert.alert('Info', `Please complete the ${provider} authentication in the browser.`);
      }
    } catch (error: any) {
      console.error(`Error enabling ${provider}:`, error);
      Alert.alert('Error', `Failed to enable ${provider} integration.`);
    }
  };

  /**
   * Unlinks the given provider from the user's Clerk account.
   */
  const handleUnlinkAccount = async (provider: string) => {
    const externalAccount = user?.externalAccounts?.find(
      (account) => account.provider === provider.toLowerCase()
    );

    if (!externalAccount) {
      Alert.alert('Error', 'Integration not found.');
      return;
    }

    Alert.alert(
      `Disable ${provider}`,
      `Are you sure you want to disable your ${provider} integration?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              await externalAccount.destroy();
              Alert.alert('Success', `${provider} integration has been disabled.`);
            } catch (error) {
              console.error(`Error disabling ${provider}:`, error);
              Alert.alert('Error', `Failed to disable ${provider} integration.`);
            }
          },
        },
      ]
    );
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#f8fafc', '#e0e7ff']}
          style={StyleSheet.absoluteFill}
        />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#f8fafc', '#e0e7ff']}
          style={StyleSheet.absoluteFill}
        />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Please sign in to view settings.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'Google':
        return 'logo-google';
      case 'Apple':
        return 'logo-apple';
      case 'Facebook':
        return 'logo-facebook';
      case 'Twitter':
        return 'logo-twitter';
      case 'LinkedIn':
        return 'logo-linkedin';
      case 'WhatsApp':
        return 'logo-whatsapp';
      default:
        return 'link';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'Google':
        return '#db4437';
      case 'Apple':
        return '#000000';
      case 'Facebook':
        return '#4267B2';
      case 'Twitter':
        return '#1DA1F2';
      case 'LinkedIn':
        return '#0077B5';
      case 'WhatsApp':
        return '#25D366';
      default:
        return '#666666';
    }
  };

  const isProviderLinked = (provider: string) => {
    return user.externalAccounts?.some(
      (account) => account.provider === provider.toLowerCase()
    );
  };

  const providers = ['Google', 'Apple', 'Facebook', 'Twitter', 'LinkedIn', 'WhatsApp'];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e0e7ff']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#6366f1" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Settings
          </ThemedText>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Profile
          </ThemedText>
          
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {user.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#6366f1" />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <ThemedText type="defaultSemiBold" style={styles.userName}>
                  {user.fullName || 'No name set'}
                </ThemedText>
                <ThemedText style={styles.userEmail}>
                  {user.primaryEmailAddress?.emailAddress}
                </ThemedText>
              </View>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>User ID:</ThemedText>
                <ThemedText style={styles.detailValue}>{user.id}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Created:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Last Sign In:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Unknown'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Communication Integrations Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Communication Integrations
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Connect your communication platforms to centralize your contacts and messages in one place.
          </ThemedText>

          {providers.map((provider) => {
            const isLinked = isProviderLinked(provider);
            return (
              <View key={provider} style={styles.integrationCard}>
                <View style={styles.integrationHeader}>
                  <View style={styles.integrationIcon}>
                    <Ionicons
                      name={getProviderIcon(provider) as any}
                      size={24}
                      color={getProviderColor(provider)}
                    />
                  </View>
                  <View style={styles.integrationInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.integrationName}>
                      {provider}
                    </ThemedText>
                    <ThemedText style={styles.integrationStatus}>
                      {isLinked ? 'Enabled' : 'Not enabled'}
                    </ThemedText>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.integrationButton,
                    isLinked ? styles.unlinkButton : styles.linkButton,
                  ]}
                  onPress={() =>
                    isLinked
                      ? handleUnlinkAccount(provider)
                      : handleLinkAccount(provider)
                  }
                >
                  <ThemedText
                    style={[
                      styles.integrationButtonText,
                      isLinked ? styles.unlinkButtonText : styles.linkButtonText,
                    ]}
                  >
                    {isLinked ? 'Disable' : 'Enable'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Let gradient show through
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1', // Accent color for visibility
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
    color: '#1e293b', // Dark text for contrast
  },
  sectionDescription: {
    fontSize: 14,
    color: '#475569', // Muted dark text
    marginBottom: 16,
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: '#ffffffcc', // Semi-transparent white for card
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    marginBottom: 4,
    color: '#1e293b', // Dark text
  },
  userEmail: {
    fontSize: 14,
    color: '#475569', // Muted dark text
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e7ff',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b', // Muted
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b', // Dark text
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  integrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffffcc', // Semi-transparent white
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  integrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  integrationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    marginBottom: 2,
    color: '#1e293b', // Dark text
  },
  integrationStatus: {
    fontSize: 12,
    color: '#64748b', // Muted
  },
  integrationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  linkButton: {
    backgroundColor: '#6366f1',
  },
  unlinkButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  integrationButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  linkButtonText: {
    color: '#ffffff',
  },
  unlinkButtonText: {
    color: '#ef4444',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});