import mysql.connector
import bcrypt
from datetime import datetime

def crear_y_asignar_usuario(cedula, nombre, rol, contrasena, tambo_id):
    try:
        # Hashear la contraseña
        contrasena_hash = bcrypt.hashpw(contrasena.encode('utf-8'), bcrypt.gensalt())

        # Conectar a la base de datos
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )
        cursor = conexion.cursor()

        # Insertar el usuario en la tabla 'usuarios'
        query_usuario = """
            INSERT INTO usuarios (cedula, nombre, rol, contrasena_hash)
            VALUES (%s, %s, %s, %s)
        """
        valores_usuario = (cedula, nombre, rol, contrasena_hash)
        cursor.execute(query_usuario, valores_usuario)

        # Obtener el ID del usuario recién insertado
        usuario_id = cursor.lastrowid

        # Insertar en la tabla 'usuario_tambo'
        query_asignacion = """
            INSERT INTO usuario_tambo (usuario_id, tambo_id, rol_en_tambo, fecha_asignacion)
            VALUES (%s, %s, %s, %s)
        """
        fecha = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        valores_asignacion = (usuario_id, tambo_id, rol, fecha)
        cursor.execute(query_asignacion, valores_asignacion)

        conexion.commit()
        return {"ok": True, "mensaje": "✅ Usuario creado y asignado correctamente."}

    except mysql.connector.Error as e:
        return {"ok": False, "error": f"❌ Error al crear o asignar el usuario: {str(e)}"}

    finally:
        if conexion.is_connected():
            cursor.close()
            conexion.close()