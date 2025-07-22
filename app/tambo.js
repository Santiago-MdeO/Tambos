import React, { useState } from 'react';
import { Modal, Pressable, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';

export default function TamboScreen() {
  const router = useRouter();
  // const { user, logout } = useAuth();
  const { user, setUser, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const tambos = ['Tambo El Roble', 'Tambo La Esperanza', 'Tambo La Casa', 'Tambo El Almendro', 'Tambo La Cueva'];

  const getIniciales = (nombre = '') => {
    const partes = nombre.trim().split(' ');
    return partes.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
  
    if (permissionResult.granted === false) {
      alert('Se necesita permiso para acceder a la galería.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.IMAGE,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const nuevaFoto = result.assets[0].uri;
      console.log("Foto seleccionada:", nuevaFoto);
      setUser({ ...user, fotoUrl: nuevaFoto }); // Actualizar fotoUrl en el estado de user
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado con avatar */}
      <View style={styles.userInfoContainer}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.userName}>{user?.nombre}</Text>
          <Avatar
            rounded
            size={32}
            source={user?.fotoUrl ? { uri: user.fotoUrl } : undefined}
            title={getIniciales(user?.nombre)}
            containerStyle={{ backgroundColor: '#086b39', marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>

      {/* Título */}
      <Text style={styles.header}>Seleccioná un Tambo</Text>

      {/* Lista de tambos */}
      {tambos.map((nombre, i) => (
        <TouchableOpacity key={i} style={styles.tamboBox} onPress={() => alert(`Seleccionado: ${nombre}`)}>
          <Text style={styles.tamboText}>{nombre}</Text>
        </TouchableOpacity>
      ))}

      {/* Modal de perfil */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Avatar grande */}
            <TouchableOpacity onPress={pickImage}>
              <Avatar
                rounded
                size={80}
                source={user?.fotoUrl ? { uri: user.fotoUrl } : undefined}
                title={getIniciales(user?.nombre)}
                containerStyle={{ backgroundColor: '#086b39', marginBottom: 15 }}
              />
            </TouchableOpacity>

            <Text>Nombre: {user?.nombre}</Text>
            <Text>Cédula: {user?.cedula}</Text>
            <Text>Rol: {user?.rol || 'Sin rol asignado'}</Text>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                logout();
                router.replace('/');
                setModalVisible(false);
              }}
            >
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>

            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 15, color: 'gray' }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80, // para que no se superponga el badge con el contenido
    padding: 30,
    backgroundColor: '#FCFAF5',
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  tamboBox: {
    backgroundColor: '#E7F4EA',
    padding: 15,
    borderRadius: 8,
    borderColor: '#86efac', // verde intermedio opcional
    borderWidth: 1,
    marginBottom: 15,
    alignItems: 'center',
  },
  tamboText: {
    fontSize: 16,
    color: '#086b39',
    fontWeight: '600',
  },
  greetingContainer: {
    backgroundColor: '#E7F4EA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // para Android
  },
  greetingText: {
    fontSize: 16,
    color: '#086b39',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#086b39',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfoContainer: {
    position: 'absolute',
    top: 40, // o ajustalo según se necesite
    right: 20,
    zIndex: 10,
  },

  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F4EA',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  userName: {
    fontSize: 14,
    color: '#086b39',
    fontWeight: '600',
    marginRight: 6,
  },

  profileIcon: {
    fontSize: 16,
    color: '#086b39',
  },
});