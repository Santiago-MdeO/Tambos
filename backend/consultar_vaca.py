import mysql.connector

def obtener_datos_vaca_con_notas(vaca_id):
    conexion = mysql.connector.connect(
        host="localhost",
        user="root",
        password="zephyra2025",
        database="tambo_db"
    )

    cursor = conexion.cursor(dictionary=True)

    query = """
    SELECT 
        v.*, 
        n.id AS nota_id, n.contenido, n.fecha_creacion, 
        u.nombre AS nombre_usuario, u.rol 
    FROM vacas v
    LEFT JOIN notas n ON v.identificador = n.vaca_id
    LEFT JOIN usuarios u ON n.usuario_id = u.id
    WHERE v.identificador = %s
    ORDER BY n.fecha_creacion DESC;
    """

    cursor.execute(query, (vaca_id,))
    resultados = cursor.fetchall()

    cursor.close()
    conexion.close()

    if not resultados:
        return None

    # Armamos el JSON
    vaca = {
        "vaca": {
            "identificador": resultados[0]["identificador"],
            "sexo": resultados[0]["sexo"],
            "anio_nacimiento": resultados[0]["anio_nacimiento"],
            "estado_salud": resultados[0]["estado_salud"],
            "categoria": resultados[0]["categoria"],
            "raza_cruza": resultados[0]["raza_cruza"],
            "castrado": resultados[0]["castrado"],
            "notas": []
        }
    }

    for fila in resultados:
        if fila["nota_id"]:
            vaca["vaca"]["notas"].append({
                "id": fila["nota_id"],
                "contenido": fila["contenido"],
                "fecha_creacion": fila["fecha_creacion"],
                "autor": fila["nombre_usuario"],
                "rol": fila["rol"]
            })

    return vaca