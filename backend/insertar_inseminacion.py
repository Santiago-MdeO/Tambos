import mysql.connector
from datetime import datetime

def insertar_inseminacion(identificador_vaca, tambo_id, fecha_inseminacion, inseminador_id):
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )
        cursor = conexion.cursor()

        fecha_asignacion = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        sql = """
        INSERT INTO inseminaciones_asignadas (
            identificador_vaca,
            tambo_id,
            fecha_asignacion,
            fecha_inseminacion,
            inseminador_id
        ) VALUES (%s, %s, %s, %s, %s)
        """

        valores = (
            identificador_vaca,
            tambo_id,
            fecha_asignacion,
            fecha_inseminacion,
            inseminador_id
        )

        cursor.execute(sql, valores)
        conexion.commit()

        return {"ok": True, "mensaje": "Asignación registrada correctamente"}

    except mysql.connector.Error as error:
        return {"ok": False, "error": str(error)}

    finally:
        cursor.close()
        conexion.close()