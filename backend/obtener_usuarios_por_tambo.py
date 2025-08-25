import mysql.connector

def obtener_usuarios_por_tambo(tambo_id):
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )
        cursor = conexion.cursor(dictionary=True)

        query = """
            SELECT u.id, u.nombre, ut.rol_en_tambo
            FROM usuario_tambo ut
            JOIN usuarios u ON ut.usuario_id = u.id
            WHERE ut.tambo_id = %s
        """

        cursor.execute(query, (tambo_id,))
        usuarios = cursor.fetchall()

        cursor.close()
        conexion.close()

        return {"ok": True, "usuarios": usuarios}

    except Exception as e:
        return {"ok": False, "error": str(e)}