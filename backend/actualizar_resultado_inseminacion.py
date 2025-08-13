import mysql.connector

def actualizar_resultado_inseminacion(id_asignacion: int, resultado: str, inseminador_id: int):
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )
        cursor = conexion.cursor()

        query = """
        UPDATE inseminaciones_asignadas
        SET resultado = %s
        WHERE id = %s AND inseminador_id = %s
        """

        valores = (resultado, id_asignacion, inseminador_id)
        cursor.execute(query, valores)
        conexion.commit()

        modificado = cursor.rowcount > 0

        cursor.close()
        conexion.close()

        if modificado:
            return {"ok": True, "mensaje": "Resultado actualizado correctamente"}
        else:
            return {"ok": False, "error": "No autorizado o asignación inexistente."}

    except Exception as e:
        return {"ok": False, "error": str(e)}