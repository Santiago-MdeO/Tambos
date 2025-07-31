import mysql.connector

# Conexión a la base de datos
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="zephyra2025",
    database="tambo_db"
)

cursor = conexion.cursor()

crear_tabla = """
CREATE TABLE IF NOT EXISTS notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vaca_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vaca_id) REFERENCES vacas(identificador),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
"""

cursor.execute(crear_tabla)
conexion.commit()
print("✅ Tabla 'notas' creada correctamente.")

cursor.close()
conexion.close()