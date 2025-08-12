import mysql.connector

# Conexión a la base de datos
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="zephyra2025",
    database="tambo_db"
)

cursor = conexion.cursor()

# Script SQL para crear la tabla de asignaciones de inseminación
crear_tabla_sql = """
CREATE TABLE IF NOT EXISTS inseminaciones_asignadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identificador_vaca INT NOT NULL,
    tambo_id INT NOT NULL,
    fecha_asignacion DATETIME NOT NULL,
    fecha_inseminacion DATE,
    inseminador_id INT NOT NULL,
    
    FOREIGN KEY (tambo_id) REFERENCES tambos(id),
    FOREIGN KEY (inseminador_id) REFERENCES usuarios(id),
    FOREIGN KEY (identificador_vaca, tambo_id) REFERENCES vacas(identificador, tambo_id)
);
"""

try:
    cursor.execute(crear_tabla_sql)
    conexion.commit()
    print("✅ Tabla 'inseminaciones_asignadas' creada correctamente.")
except mysql.connector.Error as error:
    print(f"❌ Error al crear la tabla: {error}")
finally:
    cursor.close()
    conexion.close()
    