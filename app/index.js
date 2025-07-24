import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loginUsuario } from '../lib/api';
import { ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';


export default function LoginScreen() {
  const router = useRouter();
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorCedula, setErrorCedula] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  const { login } = useAuth(); // Accedemos a la función para guardar el user

  const handleLogin = async () => {
    // 🔄 Limpiamos errores previos antes de validar de nuevo
    setErrorCedula('');
    setErrorPassword('');

    let valid = true;

    // Validar cédula
    if (!cedula) {
      setErrorCedula('Ingresá tu cédula');
      valid = false;
    } else if (cedula.length !== 8) {
      setErrorCedula('La cédula debe tener exactamente 8 dígitos.');
      valid = false;
    }
    // Validar contraseña
    if (!password) {
      setErrorPassword('Ingresá tu contraseña.');
      valid = false;
    }

    if (!valid) return;

    setLoading(true); // 🔄 Comienza la carga

    try {
      // 📡 Hacemos la solicitud de login al servidor
      const data = await loginUsuario(cedula, password);

      // ✅ Si la respuesta fue exitosa (login correcto)
      if (data.ok) {
        console.log('Usuario logueado:', data.usuario); // 👀 Solo visible en consola para debug
        login(data.usuario); // 🔐 Guardamos al usuario en el contexto global (AuthContext)
        router.push('/tambo'); // 🚀 Navegamos a la pantalla principal de gestión
      } else {
        // ⚠️ Si el login fue rechazado por el servidor
        alert(data.error || 'Cédula o contraseña incorrecta');
      }

    } catch (error) {
      // ❌ Si ocurre un error inesperado (sin conexión, servidor caído, etc.)
      console.error('Error al intentar loguear:', error);
      alert('Ocurrió un error al intentar iniciar sesión. Verificá tu conexión.');
    } finally {
      setLoading(false); // ✅ Asegura que el botón vuelva a estado normal
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>
            Gestión de{'\n'}Tambos
          </Text>
        </View>

        {/* Cédula */}
        <Text style={styles.label}>Cédula de identidad</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="1.234.567-8"
            value={cedula}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '').slice(0, 8); // asegura que no pase los 8
              setCedula(cleaned);
              setErrorCedula('');
            }}
            onFocus={() => setErrorCedula('')}
            keyboardType="numeric"
            maxLength={8}
          />
        </View>
        {errorCedula !== '' && (
          <Text style={styles.errorText}>{errorCedula}</Text>
        )}

        {/* Contraseña */}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Contraseña"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorPassword('');
            }}
            secureTextEntry={!mostrarPassword}
            onFocus={() => setErrorPassword('')}
          />
          <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
            <AntDesign name={mostrarPassword ? 'eye' : 'eyeo'} size={20} color="#555" />
          </TouchableOpacity>
        </View>
        {errorPassword !== '' && (
          <Text style={styles.errorText}>{errorPassword}</Text>
        )}

        {/* Botón */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginTop: 4,
  },

  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
    fontSize: 16,
  },
});