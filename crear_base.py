import mysql.connector  # Importamos el conector que acabás de instalar

# Conectamos a MySQL (usamos el usuario root que creaste)
conexion = mysql.connector.connect(
    host="localhost",         # Porque MySQL está en tu propia máquina
    user="root",              # Usuario administrador por defecto
    password="zephyra2025"  # ← Reemplazá esto por la contraseña real, entre comillas
)

# Creamos un cursor (una especie de herramienta para enviar órdenes)
cursor = conexion.cursor()

# Creamos una base de datos llamada tambo_db si todavía no existe
cursor.execute("CREATE DATABASE IF NOT EXISTS tambo_db")

# Confirmamos que todo salió bien
print("✅ Base de datos 'tambo_db' creada o ya existente.")

# Siempre cerramos la conexión cuando terminamos
cursor.close()
conexion.close()