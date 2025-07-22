import mysql.connector

# Conexión con la base de datos
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="zephyra2025",  # Reemplazá por la contraseña que usás
    database="tambo_db"
)

cursor = conexion.cursor()

# Insertamos una vaca con todos sus datos
query = """
INSERT INTO vacas (
    identificador,
    dico_propietario,
    estacion_nacimiento,
    anio_nacimiento,
    categoria,
    sexo,
    raza_cruza,
    castrado,
    estado_salud,
    notas
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

valores = (
    458,                    # identificador
    "UY123456",             # dico_propietario
    "Primavera",            # estación_nacimiento
    2020,                   # año_nacimiento
    "Vaquillona",           # categoría
    "H",                    # sexo
    "Holando",              # raza_cruza
    False,                  # castrado
    "Sana",                 # estado_salud
    "Animal en buen estado" # notas
)

cursor.execute(query, valores)
conexion.commit()

print("✅ Vaca insertada correctamente.")

cursor.close()
conexion.close()