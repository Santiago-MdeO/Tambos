// app/_layout.js
import { Stack } from 'expo-router';
import AppHeader from '../components/AppHeader';
import { AuthProvider } from '../context/AuthContext'; // 👈 importá el AuthProvider

export default function Layout() {
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
    </AuthProvider>
  );
}

