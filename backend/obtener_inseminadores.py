import mysql.connector

def obtener_inseminadores_por_tambo(tambo_id):
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )

        cursor = conexion.cursor(dictionary=True)

        query = """
        SELECT u.id, u.nombre
        FROM usuario_tambo ut
        JOIN usuarios u ON ut.usuario_id = u.id
        WHERE ut.tambo_id = %s AND LOWER(ut.rol_en_tambo) = 'inseminador'
        """

        cursor.execute(query, (tambo_id,))
        inseminadores = cursor.fetchall()

        cursor.close()
        conexion.close()

        return {"ok": True, "inseminadores": inseminadores}

    except Exception as e:
        return {"ok": False, "error": str(e)}