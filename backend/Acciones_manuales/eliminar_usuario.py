import mysql.connector

# Datos de conexión
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="zephyra2025",
    database="tambo_db"
)

cursor = conexion.cursor()

# 🔸 Cédula del usuario a eliminar
cedula_a_eliminar = input("Ingrese la cédula del usuario que desea eliminar: ")

# Comando SQL
eliminar = "DELETE FROM usuarios WHERE cedula = %s"

try:
    cursor.execute(eliminar, (cedula_a_eliminar,))
    conexion.commit()

    if cursor.rowcount > 0:
        print(f"✅ Usuario con cédula {cedula_a_eliminar} eliminado correctamente.")
    else:
        print("⚠️ No se encontró un usuario con esa cédula.")
except mysql.connector.Error as error:
    print(f"❌ Error al eliminar el usuario: {error}")

cursor.close()
conexion.close()