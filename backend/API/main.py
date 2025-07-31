from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from backend.verificar_login import verificar_usuario
from backend.consultar_vaca import obtener_datos_vaca_con_notas
from backend.insertar_nota import insertar_nota
from backend.auth import crear_token  # importá esta función
from backend.auth import verificar_token

app = FastAPI()

class Credenciales(BaseModel):
    cedula: str
    contrasena: str

class NuevaNota(BaseModel):
    vaca_id: int
    contenido: str
    motivo: str

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