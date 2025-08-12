import mysql.connector

def obtener_historial_inseminaciones(identificador_vaca, tambo_id):
    conexion = mysql.connector.connect(
        host="localhost",
        user="root",
        password="zephyra2025",
        database="tambo_db"
    )
    cursor = conexion.cursor(dictionary=True)

    sql = """
        SELECT 
            ia.fecha_asignacion,
            ia.fecha_inseminacion,
            ia.resultado,
            u.nombre AS nombre_inseminador,
            u.cedula AS cedula_inseminador,
            u.rol AS rol_inseminador
        FROM inseminaciones_asignadas ia
        JOIN usuarios u ON ia.inseminador_id = u.id
        WHERE ia.identificador_vaca = %s AND ia.tambo_id = %s
        ORDER BY ia.fecha_asignacion DESC;
    """

    cursor.execute(sql, (identificador_vaca, tambo_id))
    historial = cursor.fetchall()

    cursor.close()
    conexion.close()

    return historial