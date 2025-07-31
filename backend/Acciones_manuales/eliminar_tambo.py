import mysql.connector

# ==== CONFIGURACIÓN DE CONEXIÓN ====
config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'zephyra2025',  # Reemplazá por tu contraseña real
    'database': 'tambo_db'
}

def eliminar_tambo_por_id(tambo_id):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()

        # Verificamos si el tambo existe
        cursor.execute("SELECT nombre FROM tambos WHERE id = %s", (tambo_id,))
        resultado = cursor.fetchone()

        if resultado is None:
            print(f"No existe ningún tambo con id {tambo_id}.")
            return

        nombre = resultado[0]

        # Confirmación por consola
        confirmacion = input(f"¿Estás seguro que querés eliminar el tambo '{nombre}' (id {tambo_id})? [s/n]: ").lower()
        if confirmacion != 's':
            print("Operación cancelada.")
            return

        # Eliminación
        cursor.execute("DELETE FROM tambos WHERE id = %s", (tambo_id,))
        conn.commit()
        print(f"✅ Tambo '{nombre}' eliminado correctamente.")

    except mysql.connector.Error as error:
        print(f"Error al eliminar tambo: {error}")

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# ==== EJECUCIÓN DIRECTA DESDE TERMINAL ====
if __name__ == "__main__":
    try:
        tambo_id = int(input("Ingrese el ID del tambo a eliminar: "))
        eliminar_tambo_por_id(tambo_id)
    except ValueError:
        print("ID inválido. Debe ser un número entero.")