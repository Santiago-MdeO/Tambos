// Importación de librerías y componentes
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loginUsuario } from '../lib/api';
import { ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';


export default function LoginScreen() {
  // Hook de navegación
  const router = useRouter();

  // Estados del formulario
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estados para mostrar mensajes de error
  const [errorCedula, setErrorCedula] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  // Función del contexto de autenticación para guardar el usuario
  const { login } = useAuth();

  // Función que maneja el inicio de sesión
  const handleLogin = async () => {
    // Limpiamos errores previos antes de validar de nuevo
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

    // Si hay errores, se detiene la ejecución
    if (!valid) return;

    // Comienza la carga
    setLoading(true);

    try {
      //  Solicitud al servidor para verificar credenciales
      const data = await loginUsuario(cedula, password);

      // Si la respuesta es válida, guardamos el usuario y navegamos
      if (data.ok) {
        console.log('Usuario logueado:', data.usuario); // 👀 Solo visible en consola para debug
        login(data.usuario); // 🔐 Guardamos al usuario en el contexto global (AuthContext)
        router.push('/tambo'); // 🚀 Navegamos a la pantalla principal de gestión
      } else {
        // Si las credenciales no son válidas, mostramos el mensaje del backend
        alert(data.error || 'Cédula o contraseña incorrecta');
      }

    } catch (error) {
      // Si ocurre un error inesperado (sin conexión, servidor caído, etc.)
      console.error('Error al intentar loguear:', error);
      alert('Ocurrió un error al intentar iniciar sesión. Verificá tu conexión.');
    } finally {
      // Finaliza el estado de carga
      setLoading(false);
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
        )}buttonText

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
  // Contenedor principal de toda la pantalla
  container: {
    flex: 1,
    backgroundColor: '#FCFAF5',
  },
  // Estilo para el ScrollView (permite desplazamiento en pantallas pequeñas)
  scroll: {
    flexGrow: 1,
    justifyContent: 'center', // Centra verticalmente el contenido
    paddingHorizontal: 30, // Espaciado lateral
    paddingBottom: 50, // Espacio inferior extra
  },
  // Contenedor para el logo y el título
  headerContainer: {
    flexDirection: 'row', // Elementos en línea (logo + texto)
    alignItems: 'center', // Alineación vertical centrada
    justifyContent: 'center', // Centra horizontalmente
    marginBottom: 30, // Espaciado inferior
    paddingHorizontal: 10, // Reduce margen lateral
  },
  // Imagen del logo (vaca)
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain', // Mantiene proporción de la imagen
    marginRight: 12,   // Separación entre logo y texto
  },
  // Título principal (Gestión de Tambos)
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center', // Importante para mantener la alineación con el logo
    lineHeight: 38,    // Mejora la separación entre "Gestión de" y "Tambos"
  },
  // Etiqueta del campo (ej: "Cédula de identidad")
  label: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  // Botón de acción (ej: "Iniciar sesión")
  button: {
    backgroundColor: '#086b39', // Verde oscuro
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  // Estilo del texto dentro del botón
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Pie de página (ej: "Zephyra")
  footer: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
  },
  // Botón deshabilitado (cuando está cargando)
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  // Estilo para mensajes de error debajo de los inputs
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  // Contenedor del input y su ícono (si lo tuviera)
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
  // Campo de texto (input editable)
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
    fontSize: 16,
  },
});