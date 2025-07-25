// app/_layout.js
import React from 'react';
import { Stack } from 'expo-router';
import AppHeader from '../components/AppHeader';
import { AuthProvider } from '../context/AuthContext'; 
import PropTypes from 'prop-types'; // 👈 Importar PropTypes

// Recibimos children como prop del sistema de rutas de Expo Router
export default function Layout({ children }) {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerTitle: () => <AppHeader />,
          headerStyle: {
            backgroundColor: '#fefcf6',
          },
        }}
      />
      {children}
    </AuthProvider>
  );
}

// ✅ Validación de props
Layout.propTypes = {
  children: PropTypes.node, // .node acepta cualquier tipo de elemento React
};