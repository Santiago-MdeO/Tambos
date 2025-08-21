import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { obtenerVacaPorId } from '../../lib/api';
import { useRouter } from 'expo-router';

export default function AnimalesScreen() {
  const router = useRouter();
  const { tamboId } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [animal, setAnimal] = useState(null);
  const [error, setError] = useState('');
  const [showActionsFor, setShowActionsFor] = useState(null); // id del animal cuya fila muestra acciones



  const buscarAnimal = async () => {
    if (!search.trim()) return;

    try {
      const data = await obtenerVacaPorId(tamboId, search); // ✅ PASAMOS tamboId y search

      if (data.ok) {
        setAnimal(data.datos.vaca);
        setError('');
      } else {
        setAnimal(null);
        setError(data.error || 'Animal no encontrado');
      }

    } catch (err) {
      console.error(err);
      setAnimal(null);
      setError('Ocurrió un error de conexión. Intentá de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Tambos</Text>

      <Text style={{ fontStyle: 'italic' }}>Tambo: {tamboId}</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número de animal"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={buscarAnimal}
        />
      </View>

      {error !== '' && (
        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
      )}

      {animal && (
        <View style={{ marginBottom: 12 }}>
          <TouchableOpacity
            style={styles.animalBox}
            onPress={() =>
              setShowActionsFor(prev => (prev === animal.identificador ? null : animal.identificador))
            }
          >
            <Text style={styles.animalId}>UY {animal.identificador}</Text>
            <Text style={styles.animalRaza}>{animal.raza_cruza}</Text>
          </TouchableOpacity>

          {showActionsFor === animal.identificador && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionPrimary]}
                onPress={() =>
                  router.push({
                    pathname: '/animales/[id]',
                    params: { id: String(animal.identificador), tamboId: String(tamboId) },
                  })
                }
              >
                <Text style={styles.actionText}>Notas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionSecondary]}
                onPress={() =>
                  router.push({
                    pathname: '/inseminacion/[id]',
                    params: { id: String(animal.identificador), tamboId: String(tamboId) },
                  })
                }
              >
                <Text style={styles.actionText}>Inseminar</Text>
              </TouchableOpacity>

            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Agregar nuevo animal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
  animalBox: {
    backgroundColor: '#e4f6e4',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  animalId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  animalRaza: {
    fontSize: 14,
    color: '#444',
  },
  button: {
    backgroundColor: '#176f3d',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionPrimary: {
    backgroundColor: '#176f3d',
  },
  actionSecondary: {
    backgroundColor: '#0b5c2f',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});