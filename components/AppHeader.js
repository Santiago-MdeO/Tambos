// components/AppHeader.js
import React from 'react';
import { View, Text, Image } from 'react-native';

export default function AppHeader() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('../assets/logo.png')}
        style={{ width: 30, height: 30, resizeMode: 'contain', marginRight: 8 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
        Gestión de Tambos
      </Text>
    </View>
  );
}