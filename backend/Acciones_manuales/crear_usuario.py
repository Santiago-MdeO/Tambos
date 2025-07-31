import mysql.connector
import bcrypt

# Datos del usuario (pueden venir más adelante desde un formulario)
cedula = "987654321"
nombre = "Usuario de prueba 2"
rol = "desarrollo"
contrasena = "123456789"

# Hasheamos la contraseña (para no guardarla en texto plano)
contrasena_hash = bcrypt.hashpw(contrasena.encode('utf-8'), bcrypt.gensalt())

# Conectamos a la base de datos
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="zephyra2025",
    database="tambo_db"
)

cursor = conexion.cursor()

query = """
INSERT INTO usuarios (cedula, nombre, rol, contrasena_hash)
VALUES (%s, %s, %s, %s)
"""

cursor.execute(query, (cedula, nombre, rol, contrasena_hash))
conexion.commit()

print("✅ Usuario creado correctamente.")

cursor.close()
conexion.close()