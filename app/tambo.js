import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TamboScreen() {
  const router = useRouter();

  const tambos = ['Tambo El Roble', 'Tambo La Esperanza'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/*<Image source={require('../assets/logo.png')} style={styles.logo} />*/}
        <Text style={styles.title}>Gestión de Tambos</Text>
      </View>

      <Text style={styles.subtitle}>Tambos</Text>

      {tambos.map((nombre, i) => (
        <TouchableOpacity key={i} onPress={() => alert(`Seleccionado: ${nombre}`)}>
          <Text style={styles.tambo}>{nombre}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefcf6',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tambo: {
    fontSize: 18,
    marginBottom: 12,
  },
});