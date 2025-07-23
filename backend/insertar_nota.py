import mysql.connector
from datetime import datetime

def insertar_nota(vaca_id, usuario_id, contenido, motivo):
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )

        cursor = conexion.cursor()

        query = """
            INSERT INTO notas (vaca_id, usuario_id, contenido, motivo, fecha_creacion)
            VALUES (%s, %s, %s, %s, %s)
        """

        fecha_creacion = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        valores = (vaca_id, usuario_id, contenido, motivo, fecha_creacion)

        cursor.execute(query, valores)
        conexion.commit()

        cursor.close()
        conexion.close()

        return {"ok": True, "mensaje": "Nota insertada correctamente"}

    except Exception as e:
        return {"ok": False, "error": str(e)}