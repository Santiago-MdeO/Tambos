import mysql.connector

conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="zephyra2025",
    database="tambo_db"
)

cursor = conexion.cursor()

crear_tabla = """
CREATE TABLE IF NOT EXISTS usuarios (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE,
    nombre VARCHAR(100),
    rol ENUM('tambero', 'inseminador', 'patron', 'desarrollo', 'veterinario'),
    contrasena_hash VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

cursor.execute(crear_tabla)
conexion.commit()

print("✅ Tabla 'usuarios' creada correctamente.")

cursor.close()
conexion.close()