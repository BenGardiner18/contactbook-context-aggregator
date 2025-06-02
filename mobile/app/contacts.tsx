import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useBackendApi, Contact } from '../services/backendApi'
import { useGoogleContacts, getGoogleAccessToken } from '../services/googleContacts'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  
  const { fetchGoogleContacts, getCachedContacts, healthCheck } = useBackendApi()
  const { getGoogleToken } = useGoogleContacts()

  useEffect(() => {
    loadContacts()
  }, [])

  // Test function to debug Google token extraction
  const testGoogleToken = async () => {
    try {
      console.log('=== Testing Google Token Extraction ===')
      
      // Test with React hook
      const tokenFromHook = await getGoogleToken()
      console.log('Token from hook:', tokenFromHook ? 'SUCCESS' : 'FAILED')
      
      // Test with utility function
      const tokenFromUtil = await getGoogleAccessToken()
      console.log('Token from utility:', tokenFromUtil ? 'SUCCESS' : 'FAILED')
      
      if (tokenFromHook || tokenFromUtil) {
        Alert.alert(
          'Token Test Success!', 
          `Hook: ${tokenFromHook ? '✅' : '❌'}\nUtility: ${tokenFromUtil ? '✅' : '❌'}`
        )
      } else {
        Alert.alert('Token Test Failed', 'Could not retrieve Google access token from Clerk')
      }
    } catch (error: any) {
      console.error('Token test error:', error)
      Alert.alert('Token Test Error', error.message)
    }
  }

  const loadContacts = async () => {
    try {
      setLoading(true)
      
      // First check if backend is available
      const isHealthy = await healthCheck()
      if (!isHealthy) {
        Alert.alert('Backend Unavailable', 'Please make sure the backend server is running on localhost:8000')
        return
      }

      // Try to get cached contacts first
      let contactsData = await getCachedContacts()
      
      // If no cached contacts, fetch from Google
      if (contactsData.length === 0) {
        try {
          contactsData = await fetchGoogleContacts()
        } catch (error: any) {
          if (error.message.includes('Google account not linked')) {
            Alert.alert(
              'Google Account Required', 
              'Please link your Google account in Clerk to access your contacts.',
              [{ text: 'OK' }]
            )
          } else {
            Alert.alert('Error', `Failed to fetch contacts: ${error.message}`)
          }
          return
        }
      }
      
      setContacts(contactsData)
    } catch (error: any) {
      console.error('Error loading contacts:', error)
      Alert.alert('Error', `Failed to load contacts: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const openDetails = (contact: Contact) => {
    setSelected(contact)
    setModalVisible(true)
  }
  
  const closeDetails = () => {
    setModalVisible(false)
    setSelected(null)
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 16, color: '#fff', fontSize: 16 }}>Loading contacts...</Text>
      </SafeAreaView>
    )
  }

  return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.title}>Contacts</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.testButton} onPress={testGoogleToken}>
              <Ionicons name="flask" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton} onPress={loadContacts}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={contacts}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openDetails(item)}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6366f1" />
            </TouchableOpacity>
          )}
        />
        {/* Details Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeDetails}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalClose} onPress={closeDetails}>
                <Ionicons name="close" size={28} color="#6366f1" />
              </TouchableOpacity>
              {selected && (
                <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 16 }}>
                  <Image source={{ uri: selected.avatar }} style={styles.modalAvatar} />
                  <Text style={styles.modalName}>{selected.name}</Text>
                  <Text style={styles.modalJob}>{selected.job} at {selected.company}</Text>
                  <Text style={styles.modalEmail}><Ionicons name="mail" size={16} /> {selected.email}</Text>
                  <Text style={styles.modalPhone}><Ionicons name="call" size={16} /> {selected.phone}</Text>
                  <Text style={styles.modalAddress}><Ionicons name="location" size={16} /> {selected.address}</Text>
                  <Text style={styles.modalNotes}>{selected.notes}</Text>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 32,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    padding: 4,
    marginRight: 8,
  },
  refreshButton: {
    padding: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#e0e7ff',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  email: {
    fontSize: 14,
    color: '#6366f1',
  },
  phone: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  modalAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
    backgroundColor: '#e0e7ff',
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  modalJob: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  modalEmail: {
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 2,
  },
  modalPhone: {
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 2,
  },
  modalAddress: {
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 8,
  },
  modalNotes: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
}) 