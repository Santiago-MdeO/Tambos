import mysql.connector

def obtener_datos_vaca_con_notas(tambo_id, identificador):
    conexion = mysql.connector.connect(
        host="localhost",
        user="root",
        password="zephyra2025",
        database="tambo_db"
    )
    cursor = conexion.cursor(dictionary=True)

    query = """
        SELECT v.*, 
               n.id AS nota_id, 
               n.contenido, 
               n.fecha_creacion,
               u.nombre AS nombre_usuario, 
               u.rol
        FROM vacas v
        LEFT JOIN notas n ON v.identificador = n.vaca_id
        LEFT JOIN usuarios u ON u.id = n.usuario_id
        WHERE v.identificador = %s AND v.tambo_id = %s
        ORDER BY n.fecha_creacion DESC
    """

    cursor.execute(query, (identificador, tambo_id))
    resultados = cursor.fetchall()

    cursor.close()
    conexion.close()

    if not resultados:
        return None

    vaca = {
        "vaca": {
            "identificador": resultados[0]["identificador"],
            "sexo": resultados[0]["sexo"],
            "fecha_nacimiento": str(resultados[0]["fecha_nacimiento"]),
            "estado_salud": resultados[0]["estado_salud"],
            "categoria": resultados[0]["categoria"],
            "raza_cruza": resultados[0]["raza_cruza"],
            "castrado": resultados[0]["castrado"],
            "fecha_ingreso_sistema": str(resultados[0]["fecha_ingreso_sistema"]),
            "notas": []
        }
    }

    for fila in resultados:
        if fila["nota_id"]:
            vaca["vaca"]["notas"].append({
                "id": fila["nota_id"],
                "contenido": fila["contenido"],
                "fecha_creacion": str(fila["fecha_creacion"]),
                "autor": fila["nombre_usuario"],
                "rol": fila["rol"]
            })

    return vaca