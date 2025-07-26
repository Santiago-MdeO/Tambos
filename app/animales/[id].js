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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal } from 'react-native';

export default function DetalleVacaScreen() {
  // Parametros de navegación
  const { id } = useLocalSearchParams(); // Obtenemos el ID de la vaca desde la URL

// Estados principales
  const [vaca, setVaca] = useState(null); // Estado para guardar los datos de la vaca
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [error, setError] = useState(null); // Estado para manejar errores

  // Estados para nueva nota
  const [contenido, setContenido] = useState(''); // Estado para el texto de la nueva nota
  const [motivo, setMotivo] = useState(''); // Estado para el motivo de la nueva nota

  // Estados de filtros y vistas
  const [verTodas, setVerTodas] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [autorFiltro, setAutorFiltro] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [showHastaPicker, setShowHastaPicker] = useState(false);
  const [showDesdePicker, setShowDesdePicker] = useState(false);

  // Contexto de autenticación
  const { user } = useAuth(); // Accedemos al usuario y su token
  
  // Cargamos los datos de la vaca al montar el componente
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

  // Función para enviar una nueva nota al backend
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

  // Si hay error
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const autoresUnicos = [...new Set((vaca?.notas || []).map((n) => n.autor))];

  let notasFiltradas = vaca?.notas || [];

  // Ordenar por fecha de creación descendente
  notasFiltradas.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
  if (autorFiltro) {
    notasFiltradas = notasFiltradas.filter((n) =>
      n.autor.toLowerCase().includes(autorFiltro.toLowerCase())
    );
  }
  if (desde) {
    notasFiltradas = notasFiltradas.filter((n) =>
      new Date(n.fecha_creacion) >= new Date(desde)
    );
  }
  if (hasta) {
    notasFiltradas = notasFiltradas.filter((n) =>
      new Date(n.fecha_creacion) <= new Date(hasta)
    );
  }
  const notasAMostrar = verTodas
    ? notasFiltradas
    : notasFiltradas.slice(0, 2); // mostrar solo las últimas 2


  // Render principal
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

      <View style={styles.filaTitulo}>
        <Text style={styles.subtitle}>Historial de notas</Text>
        <TouchableOpacity onPress={() => setMostrarFiltros(!mostrarFiltros)}>
          <Text style={styles.filtrosBoton}>
            {mostrarFiltros ? 'Ocultar filtros' : 'Filtros'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 10,
            width: '80%',
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
              Seleccioná un autor
            </Text>
            {autoresUnicos.map((autor) => (
              <TouchableOpacity
                key={autor}
                onPress={() => {
                  setAutorFiltro(autor);
                  setModalVisible(false);
                }}
                style={{ paddingVertical: 8 }}
              >
                <Text style={{ fontSize: 15, color: '#333' }}>{autor}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                setAutorFiltro('');
                setModalVisible(false);
              }}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: '#888', textAlign: 'right' }}>Quitar filtro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {mostrarFiltros && (
        <View style={styles.filtrosBox}>
          {/* Filtro por autor */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.autorSelector}
          >
            <Text style={styles.autorSelectorText}>
              {autorFiltro ? autorFiltro : 'Todos los autores'}
            </Text>
          </TouchableOpacity>

          {/* Filtro por fechas */}
          <View style={styles.filaFechas}>
            {/* Campo DESDE */}
            <TouchableOpacity onPress={() => setShowDesdePicker(true)} style={{ flex: 1, marginRight: 5 }}>
              <TextInput
                style={styles.inputFiltro}
                placeholder="Desde (YYYY-MM-DD)"
                value={desde}
                editable={false}
                placeholderTextColor="#999"
              />
            </TouchableOpacity>

            {/* Campo HASTA */}
            <TouchableOpacity onPress={() => setShowHastaPicker(true)} style={{ flex: 1, marginLeft: 5 }}>
              <TextInput
                style={styles.inputFiltro}
                placeholder="Hasta (YYYY-MM-DD)"
                value={hasta}
                editable={false}
                placeholderTextColor="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Pickers deben ir fuera del View de campos */}
          {showDesdePicker && (
            <DateTimePicker
              value={desde ? new Date(desde) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDesdePicker(false);
                if (selectedDate) {
                  const isoDate = selectedDate.toISOString().split('T')[0];
                  setDesde(isoDate);
                }
              }}
            />
          )}

          {showHastaPicker && (
            <DateTimePicker
              value={hasta ? new Date(hasta) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowHastaPicker(false);
                if (selectedDate) {
                  const isoDate = selectedDate.toISOString().split('T')[0];
                  setHasta(isoDate);
                }
              }}
            />
          )}

          {/* Botón para limpiar filtros */}
          <TouchableOpacity
            onPress={() => {
              setAutorFiltro('');
              setDesde('');
              setHasta('');
            }}
          >
            <Text style={{ color: 'gray', textAlign: 'right', marginTop: 6 }}>
              Limpiar filtros
            </Text>
          </TouchableOpacity>
        </View>


      )}

      {notasFiltradas.length === 0 ? (
        <Text style={styles.noNotas}>Sin notas registradas.</Text>
      ) : (
        <>
          {notasAMostrar.map((nota) => (
            <View key={nota._id} style={styles.notaBox}>
              <Text style={styles.notaTexto}>{nota.contenido}</Text>
              <Text style={styles.notaAutor}>
                {nota.autor} - {nota.rol} | {nota.fecha_creacion}
              </Text>
            </View>
          ))}

          {/* 👇 Botón para expandir / reducir historial */}
          {notasFiltradas.length > 3 && (
            <TouchableOpacity onPress={() => setVerTodas(!verTodas)}>
              <Text style={styles.verTodas}>
                {verTodas ? 'Ver menos' : 'Ver historial completo'}
              </Text>
            </TouchableOpacity>
          )}
        </>
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
  // --- Estructura general ---
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

  // --- Títulos y subtítulos ---
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#222',
  },

  // --- Ficha del animal ---
  infoBox: {
    marginBottom: 20,
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

  // --- Historial de notas ---
  noNotas: {
    fontStyle: 'italic',
    color: '#999',
    marginTop: 10,
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
    lineHeight: 18,
  },
  notaAutor: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
    fontStyle: 'italic',
  },
  verTodas: {
    color: '#086b39',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    marginBottom: 16,
    textAlign: 'center',
  },

  // --- Filtros ---
  filaTitulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  filtrosBoton: {
    color: '#176f3d',
    fontSize: 14,
    fontWeight: '500',
  },
  filtrosBox: {
    marginTop: 10,
    marginBottom: 16,
  },
  autorSelector: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  autorSelectorText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  filaFechas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputFiltro: {
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },

  // --- Formulario de nueva nota ---
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  button: {
    backgroundColor: '#086b39',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- Otros ---
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});