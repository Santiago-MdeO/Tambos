import mysql.connector
#este codigo no es el de la tabal que esta en el MySQL
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="zephyra2025",
    database="tambo_db"
)

cursor = conexion.cursor()

crear_tabla = """
CREATE TABLE IF NOT EXISTS vacas (
    identificador INT PRIMARY KEY,  -- Ahora este es el ID único
    dico_propietario VARCHAR(20),
    estacion_nacimiento VARCHAR(20),
    anio_nacimiento YEAR,
    categoria VARCHAR(50),
    sexo ENUM('M','H'),
    raza_cruza VARCHAR(100),
    castrado BOOLEAN,
    estado_salud VARCHAR(100),
    notas TEXT,
    fecha_ultima_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
"""

cursor.execute(crear_tabla)
conexion.commit()

print("✅ Tabla 'vacas' creada correctamente con el identificador como clave primaria.")

cursor.close()
conexion.close()