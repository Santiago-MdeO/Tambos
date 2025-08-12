import mysql.connector

def verificar_vaca_en_tambo(identificador_vaca, tambo_id):
    conexion = mysql.connector.connect(
        host="localhost",
        user="root",
        password="zephyra2025",
        database="tambo_db"
    )
    cursor = conexion.cursor()

    query = """
        SELECT COUNT(*) FROM vacas
        WHERE identificador = %s AND tambo_id = %s
    """
    cursor.execute(query, (identificador_vaca, tambo_id))
    resultado = cursor.fetchone()[0]

    cursor.close()
    conexion.close()

    return resultado > 0  # True si existe, False si no