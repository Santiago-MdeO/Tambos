import mysql.connector
import bcrypt

def verificar_usuario(cedula, contrasena):
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )
        cursor = conexion.cursor(dictionary=True)

        # Primero obtener el usuario
        query_usuario = """
            SELECT id, nombre, rol, contrasena_hash 
            FROM usuarios 
            WHERE cedula = %s
        """
        cursor.execute(query_usuario, (cedula,))
        usuario = cursor.fetchone()

        if usuario is None:
            return { "ok": False, "error": "Usuario no registrado." }

        # Validar contraseña
        contrasena_valida = bcrypt.checkpw(
            contrasena.encode('utf-8'),
            usuario['contrasena_hash'].encode('utf-8')
        )

        if not contrasena_valida:
            return { "ok": False, "error": "Contraseña incorrecta." }

        # Obtener tambos del usuario
        query_tambos = """
            SELECT t.id, t.nombre, t.ubicacion, ut.rol_en_tambo
            FROM usuario_tambo ut
            JOIN tambos t ON ut.tambo_id = t.id
            WHERE ut.usuario_id = %s
        """
        cursor.execute(query_tambos, (usuario['id'],))
        tambos = cursor.fetchall()

        # Cerrar conexión
        cursor.close()
        conexion.close()

        return {
            "ok": True,
            "usuario": {
                "id": usuario["id"],
                "nombre": usuario['nombre'],
                "rol": usuario['rol'],
                "tambos": tambos  # Lista de diccionarios con tambos
            }
        }

    except Exception as e:
        return { "ok": False, "error": str(e) }