import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loginUsuario } from '../lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth(); // Accedemos a la función para guardar el user

  const handleLogin = async () => {
    const data = await loginUsuario(cedula, password);
  
    if (data.ok) {
      console.log('Usuario logueado:', data.usuario);
      login(res.usuario)
      router.push('/tambo');
    } else {
      alert(data.error || 'Cédula o contraseña incorrecta');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* <ScrollView contentContainerStyle={styles.scroll}> */}

      <ScrollView
        contentContainerStyle={styles.scroll}
         keyboardShouldPersistTaps="handled">

        <View style={styles.headerContainer}>
          <Image
            source={require('../assets/logo.png')} // reemplazar por la ruta correcta
            style={styles.logo}
          />
          <Text style={styles.title}>
            Gestión de{'\n'}Tambos
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cédula de identidad</Text>
          <TextInput
            style={styles.input}
            placeholder="1.234.567-8"
            value={cedula}
            onChangeText={(text) => {
              // Solo acepta números hasta 8 caracteres sin guiones ni puntos
              const cleaned = text.replace(/[^0-9]/g, '');
              if (cleaned.length <= 8) setCedula(cleaned);
            }}
            keyboardType="numeric"
            maxLength={8}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Zephyra</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF5',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 10, // 👉🏼 nuevo: reduce margen lateral
  },
  logo: {
    width: 120,        // 👉🏼 más grande
    height: 120,       // 👉🏼 más grande
    resizeMode: 'contain',
    marginRight: 12,   // 👉🏼 un poco más de espacio del texto
  },
  title: {
    fontSize: 34,      // 👉🏼 más grande
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center', // 👉🏼 importante para mantener la alineación con el logo
    lineHeight: 38,    // 👉🏼 mejora la separación entre "Gestión de" y "Tambos"
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#086b39',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
  },
});