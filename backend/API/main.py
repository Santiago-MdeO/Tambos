from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import mysql.connector
from backend.verificar_login import verificar_usuario
from backend.consultar_vaca import obtener_datos_vaca_con_notas
from backend.insertar_nota import insertar_nota
from backend.auth import crear_token
from backend.auth import verificar_token
from pydantic import BaseModel
from backend.insertar_inseminacion import insertar_inseminacion
from backend.verificar_vaca import verificar_vaca_en_tambo
from backend.consultar_inseminaciones import obtener_historial_inseminaciones
from backend.actualizar_resultado_inseminacion import actualizar_resultado_inseminacion
from backend.obtener_inseminadores import obtener_inseminadores_por_tambo
from backend.crear_y_asignar_usuario import crear_y_asignar_usuario
from backend.obtener_usuarios_por_tambo import obtener_usuarios_por_tambo

app = FastAPI()

class Credenciales(BaseModel):
    cedula: str
    contrasena: str

class NuevaNota(BaseModel):
    vaca_id: int
    contenido: str
    motivo: str

class AsignarInseminacion(BaseModel):
    identificador_vaca: int
    tambo_id: int
    fecha_inseminacion: str  # formato: YYYY-MM-DD
    inseminador_id: int

class ResultadoUpdate(BaseModel):
    id_asignacion: int
    resultado: str

class NuevoUsuario(BaseModel):
    cedula: str
    nombre: str
    rol: str
    contrasena: str

@app.get("/")
def root():
    return {"mensaje": "API activa y funcionando correctamente ✅"}

@app.post("/login")
def login(data: Credenciales):
    resultado = verificar_usuario(data.cedula, data.contrasena)

    if not resultado["ok"]:
        raise HTTPException(status_code=401, detail=resultado["error"])

    usuario = resultado["usuario"]
    token = crear_token({
        "usuario_id": usuario["id"],
        "nombre": usuario["nombre"],
        "rol": usuario["rol"]
    })

    return {
        "ok": True,
        "usuario": {
            "nombre": usuario["nombre"],
            "rol": usuario["rol"],
            "tambos": usuario["tambos"],
            "token": token
        }
    }

@app.get("/vaca/{tambo_id}/{identificador}")
def obtener_vaca(tambo_id: int, identificador: int):
    datos = obtener_datos_vaca_con_notas(tambo_id, identificador)
    if datos:
        return {"ok": True, "datos": datos}
    else:
        return {"ok": False, "mensaje": "Vaca no encontrada"}

@app.post("/nota")
def crear_nota(data: NuevaNota, authorization: str = Header(..., alias="Authorization")):
    # Extraer token
    try:
        token = authorization.split(" ")[1]  # elimina "Bearer "
    except:
        raise HTTPException(status_code=401, detail="Token mal formado")

    usuario = verificar_token(token)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido")

    resultado = insertar_nota(
        vaca_id=data.vaca_id,
        usuario_id=usuario["usuario_id"],  # se extrae del token
        contenido=data.contenido,
        motivo=data.motivo
    )

    return resultado

@app.post("/asignar-inseminacion")
def asignar_inseminacion(data: AsignarInseminacion, authorization: str = Header(..., alias="Authorization")):
    try:
        token = authorization.split(".")[1]
    except Exception:
        raise HTTPException(status_code=401, detail="Token mal formado")

    resultado = insertar_inseminacion(
        identificador_vaca=data.identificador_vaca,
        tambo_id=data.tambo_id,
        fecha_inseminacion=data.fecha_inseminacion,
        inseminador_id=data.inseminador_id
    )

    if not verificar_vaca_en_tambo(data.identificador_vaca, data.tambo_id):
        raise HTTPException(
            status_code=400,
            detail="La vaca no pertenece al tambo especificado"
        )

    if not resultado.get("ok"):
        raise HTTPException(status_code=500, detail=resultado["error"])

    return resultado

@app.get("/historial-inseminacion/{tambo_id}/{identificador_vaca}")
def historial_inseminacion(tambo_id: int, identificador_vaca: int, authorization: str = Header(..., alias="Authorization")):
    # Verificación de token
    try:
        token = authorization.split(" ")[1]
    except:
        raise HTTPException(status_code=401, detail="Token mal formado")

    usuario = verificar_token(token)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido")

    historial = obtener_historial_inseminaciones(identificador_vaca, tambo_id)

    return {
        "ok": True,
        "historial": historial
    }


@app.put("/resultado-inseminacion")
def modificar_resultado_inseminacion(data: ResultadoUpdate, authorization: str = Header(..., alias="Authorization")):
    # Extraer token
    try:
        token = authorization.split(" ")[1]  # elimina "Bearer"
    except:
        raise HTTPException(status_code=401, detail="Token mal formado")

    usuario = verificar_token(token)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido")

    inseminador_id = usuario["usuario_id"]

    resultado = actualizar_resultado_inseminacion(
        id_asignacion=data.id_asignacion,
        resultado=data.resultado,
        inseminador_id=inseminador_id
    )

    if not resultado["ok"]:
        raise HTTPException(status_code=403, detail=resultado["error"])

    return resultado

@app.get("/inseminadores/{tambo_id}")
def get_inseminadores(tambo_id: int, authorization: str = Header(..., alias="Authorization")):
    try:
        token = authorization.split(" ")[1]
    except:
        raise HTTPException(status_code=401, detail="Token mal formado")

    usuario = verificar_token(token)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido")

    resultado = obtener_inseminadores_por_tambo(tambo_id)
    return resultado

@app.post("/crear-usuario")
def crear_usuario(data: NuevoUsuario, authorization: str = Header(..., alias="Authorization")):
    # Extraer el token
    try:
        token = authorization.split(" ")[1]
    except:
        raise HTTPException(status_code=401, detail="Token mal formado")

    usuario = verificar_token(token)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido")

    usuario_id_token = usuario.get("usuario_id")
    if not usuario_id_token:
        raise HTTPException(status_code=400, detail="No se encontró el usuario_id en el token")

    # Obtener el tambo_id desde la base de datos
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="zephyra2025",
            database="tambo_db"
        )
        cursor = conexion.cursor()
        query = "SELECT tambo_id FROM usuario_tambo WHERE usuario_id = %s LIMIT 1"
        cursor.execute(query, (usuario_id_token,))
        resultado = cursor.fetchone()
        cursor.close()
        conexion.close()

        if not resultado:
            raise HTTPException(status_code=404, detail="No se encontró ningún tambo asociado a este usuario")
        
        tambo_id = resultado[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener tambo_id: {str(e)}")

    # Llamar a la función que crea el usuario
    resultado = crear_y_asignar_usuario(
        cedula=data.cedula,
        nombre=data.nombre,
        rol=data.rol,
        contrasena=data.contrasena,
        tambo_id=tambo_id
    )

    if not resultado["ok"]:
        raise HTTPException(status_code=500, detail=resultado["error"])

    return {"ok": True, "mensaje": resultado["mensaje"]}

@app.get("/usuarios-asignados/{tambo_id}")
def get_usuarios_asignados(tambo_id: int, authorization: str = Header(..., alias="Authorization")):
    try:
        token = authorization.split(" ")[1]
    except:
        raise HTTPException(status_code=401, detail="Token mal formado")

    usuario = verificar_token(token)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido")

    resultado = obtener_usuarios_por_tambo(tambo_id)
    return resultado