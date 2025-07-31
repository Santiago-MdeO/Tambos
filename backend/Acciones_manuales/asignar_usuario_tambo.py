import mysql.connector
from datetime import datetime

def asignar_usuario_a_tambo(usuario_id, tambo_id, rol_en_tambo):
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )
        cursor = conexion.cursor()

        # Verificar si ya está asignado ese rol a ese tambo
        cursor.execute("""
            SELECT * FROM usuario_tambo 
            WHERE usuario_id = %s AND tambo_id = %s
        """, (usuario_id, tambo_id))
        existe = cursor.fetchone()

        if existe:
            print("⚠️ Este usuario ya está asignado a este tambo.")
            return

        # Asignar con rol y fecha
        query = """
            INSERT INTO usuario_tambo (usuario_id, tambo_id, rol_en_tambo, fecha_asignacion)
            VALUES (%s, %s, %s, %s)
        """
        fecha = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        valores = (usuario_id, tambo_id, rol_en_tambo, fecha)

        cursor.execute(query, valores)
        conexion.commit()
        print("✅ Usuario asignado al tambo correctamente con rol:", rol_en_tambo)

    except mysql.connector.Error as e:
        print("❌ Error al asignar usuario:", e)

    finally:
        if conexion.is_connected():
            cursor.close()
            conexion.close()


# ---------- PRUEBA MANUAL ----------
if __name__ == "__main__":
    asignar_usuario_a_tambo(
        usuario_id=4,
        tambo_id=6,
        rol_en_tambo="Vaquero"  # Cambialo por "Tambero", "Vaquero", etc.
    )