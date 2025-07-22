import mysql.connector
import bcrypt

def verificar_usuario(cedula, contrasena):
    conexion = mysql.connector.connect(
        host="localhost",
        user="root",
        password="zephyra2025",
        database="tambo_db"
    )
    cursor = conexion.cursor(dictionary=True)

    query = "SELECT nombre, rol, contrasena_hash FROM usuarios WHERE cedula = %s"
    cursor.execute(query, (cedula,))
    usuario = cursor.fetchone()

    cursor.close()
    conexion.close()

    if usuario is None:
        return {
            "ok": False,
            "error": "Usuario no registrado."
        }

    contrasena_valida = bcrypt.checkpw(contrasena.encode('utf-8'), usuario['contrasena_hash'].encode('utf-8'))

    if contrasena_valida:
        return {
            "ok": True,
            "usuario": {
                "nombre": usuario['nombre'],
                "rol": usuario['rol']
            }
        }
    else:
        return {
            "ok": False,
            "error": "Contraseña incorrecta."
        }