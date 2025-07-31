import mysql.connector
from datetime import datetime

# === Conexión a la base de datos ===
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="zephyra2025",
    database="tambo_db"
)

cursor = conexion.cursor()

# === DATOS DE LA VACA ===
identificador = 111
dico_propietario = "UY246810123"
fecha_nacimiento = "2025-07-01"
categoria = "Vaquillona"
sexo = "Hembra"
raza_cruza = "Jersey x Holando"
castrado = 0  # 0 = no, 1 = sí
estado_salud = "Sana"
fecha_ingreso_sistema = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Fecha actual
tambo_id = 2  # 👈 Asignar manualmente el tambo al que pertenece esta vaca

# === Inserción en la tabla ===
sql = """
INSERT INTO vacas (
    identificador, dico_propietario, fecha_nacimiento,
    categoria, sexo, raza_cruza, castrado,
    estado_salud, fecha_ingreso_sistema, tambo_id
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

valores = (
    identificador, dico_propietario, fecha_nacimiento,
    categoria, sexo, raza_cruza, castrado,
    estado_salud, fecha_ingreso_sistema, tambo_id
)

cursor.execute(sql, valores)
conexion.commit()

print(f"✅ Vaca {identificador} creada correctamente en tambo {tambo_id}.")

cursor.close()
conexion.close()