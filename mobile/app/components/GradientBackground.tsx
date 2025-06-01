import React from 'react'
import { SafeAreaView, StyleSheet, View, ViewProps } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface GradientBackgroundProps extends ViewProps {
  children: React.ReactNode
}

export const GradientBackground = ({ children, style, ...props }: GradientBackgroundProps) => (
  <LinearGradient
    colors={['#6366f1', '#8b5cf6', '#a855f7']}
    style={[styles.gradient, style]}
  >
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, style]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  </LinearGradient>
)

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
}) 