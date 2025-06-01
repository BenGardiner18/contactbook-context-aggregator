import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, SafeAreaView, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'

// Utility to generate fake contacts
const AVATARS = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/23.jpg',
  'https://randomuser.me/api/portraits/women/56.jpg',
]

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}

function generateFakeContacts(count: number) {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Lee']
  const contacts = []
  for (let i = 0; i < count; i++) {
    const first = firstNames[getRandomInt(firstNames.length)]
    const last = lastNames[getRandomInt(lastNames.length)]
    const name = `${first} ${last}`
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`
    const phone = `+1-555-${getRandomInt(900) + 100}-${getRandomInt(9000) + 1000}`
    const avatar = AVATARS[getRandomInt(AVATARS.length)]
    const company = ['Acme Inc', 'Globex', 'Initech', 'Umbrella', 'Wayne Enterprises'][getRandomInt(5)]
    const job = ['Engineer', 'Designer', 'Manager', 'Analyst', 'Consultant'][getRandomInt(5)]
    contacts.push({
      id: `${i}`,
      name,
      email,
      phone,
      avatar,
      company,
      job,
      address: `${getRandomInt(999)} Main St, City, State`,
      notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.'
    })
  }
  return contacts
}

const CONTACTS = generateFakeContacts(20)

export default function ContactsPage() {
  const [selected, setSelected] = useState<any | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const openDetails = (contact: any) => {
    setSelected(contact)
    setModalVisible(true)
  }
  const closeDetails = () => {
    setModalVisible(false)
    setSelected(null)
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
        </View>
        <FlatList
          data={CONTACTS}
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