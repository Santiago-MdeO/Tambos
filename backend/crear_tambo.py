import mysql.connector
from datetime import date

def crear_tambo(nombre, ubicacion, estado="activo"):
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )
        cursor = conexion.cursor()

        query = """
            INSERT INTO tambos (nombre, ubicacion, estado, fecha_creacion)
            VALUES (%s, %s, %s, %s)
        """
        valores = (nombre, ubicacion, estado, date.today())

        cursor.execute(query, valores)
        conexion.commit()

        print("✅ Tambo creado correctamente.")

    except mysql.connector.Error as e:
        print("❌ Error al crear el tambo:", e)

    finally:
        if conexion.is_connected():
            cursor.close()
            conexion.close()

# ----------- PRUEBA MANUAL -----------
if __name__ == "__main__":
    crear_tambo("Tambo San José", "Ruta 11 km 22, San José")