import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { obtenerVacaPorId, crearNota } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types'; // Asegurate de tener esta línea al inicio del archivo

export default function DetalleVacaScreen() {
  const { id } = useLocalSearchParams(); // Obtenemos el ID de la vaca desde la URL
  const [vaca, setVaca] = useState(null); // Estado para guardar los datos de la vaca
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [error, setError] = useState(null); // Estado para manejar errores

  const [contenido, setContenido] = useState(''); // Estado para el texto de la nueva nota
  const [motivo, setMotivo] = useState(''); // Estado para el motivo de la nueva nota
  const { user } = useAuth(); // Accedemos al usuario y su token

  // 🔄 Cargamos los datos de la vaca al montar el componente
  useEffect(() => {
    const fetchVaca = async () => {
      try {
        const data = await obtenerVacaPorId(id);
        if (data.ok) {
          setVaca(data.datos.vaca);
        } else {
          setError(data.error || 'No se pudo obtener la información del animal.');
        }
      } catch (err) {
        console.error('Error al cargar vaca:', err);
        setError('Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchVaca();
  }, [id]);

  // 📤 Función para enviar una nueva nota al backend
  const manejarNuevaNota = async () => {
    if (!contenido || !motivo) {
      Alert.alert('Error', 'Debes completar todos los campos.');
      return;
    }

    try {
      const respuesta = await crearNota(id, contenido, motivo, user?.token);
      if (respuesta.ok) {
        // Recargamos los datos de la vaca incluyendo la nueva nota
        const data = await obtenerVacaPorId(id);
        if (data.ok) {
          setVaca(data.datos.vaca);
          setContenido('');
          setMotivo('');
          Alert.alert('Nota agregada', 'El registro fue creado con éxito.');
        }
      } else {
        Alert.alert('Error', respuesta.error || 'No se pudo crear la nota.');
      }
    } catch (err) {
      console.error('Error al enviar la nota:', err);
      Alert.alert('Error', 'Error al conectar con el servidor.');
    }
  };

  // ⏳ Mientras carga
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#176f3d" />
      </View>
    );
  }

  // ❌ Si hay error
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // ✅ Render principal
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ficha del animal</Text>

      {/* Datos básicos */}
      <View style={styles.infoBox}>
        <Info label="Identificador" value={`UY ${vaca.identificador}`} />
        <Info label="Raza / Cruza" value={vaca.raza_cruza} />
        <Info label="Fecha de nacimiento" value={vaca.fecha_nacimiento} />
        <Info label="Estado de salud" value={vaca.estado_salud} />
        <Info label="Categoría" value={vaca.categoria} />
        <Info label="Sexo" value={vaca.sexo} />
        <Info label="Castrado" value={vaca.castrado ? 'Sí' : 'No'} />
        <Info label="Fecha de ingreso" value={vaca.fecha_ingreso_sistema} />
      </View>

      {/* Notas */}
      <Text style={styles.subtitle}>Historial de notas</Text>
      {vaca.notas.length === 0 ? (
        <Text style={styles.noNotas}>Sin notas registradas.</Text>
      ) : (
        vaca.notas.map((nota) => (
          <View key={nota._id} style={styles.notaBox}>
            <Text style={styles.notaTexto}>{nota.contenido}</Text>
            <Text style={styles.notaAutor}>
              {nota.autor} - {nota.rol} | {nota.fecha_creacion}
            </Text>
          </View>
        ))
      )}

      {/* Formulario para nueva nota */}
      <Text style={styles.subtitle}>Agregar nueva nota</Text>
      <TextInput
        style={styles.input}
        placeholder="Motivo"
        value={motivo}
        onChangeText={setMotivo}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Contenido de la nota"
        value={contenido}
        onChangeText={setContenido}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={manejarNuevaNota}>
        <Text style={styles.buttonText}>Guardar nota</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Componente reutilizable para mostrar un dato
function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

Info.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]).isRequired,
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FCFAF5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFAF5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  infoBox: {
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    color: '#555',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  noNotas: {
    fontStyle: 'italic',
    color: '#666',
  },
  notaBox: {
    backgroundColor: '#e4f6e4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  notaTexto: {
    fontSize: 14,
    color: '#000',
  },
  notaAutor: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#086b39',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});