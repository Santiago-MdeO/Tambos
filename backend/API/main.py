from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from backend.verificar_login import verificar_usuario
from backend.consultar_vaca import obtener_datos_vaca_con_notas
from backend.insertar_nota import insertar_nota
from backend.auth import crear_token
from backend.auth import verificar_token
from pydantic import BaseModel
from backend.insertar_inseminacion import insertar_inseminacion
from backend.verificar_vaca import verificar_vaca_en_tambo

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