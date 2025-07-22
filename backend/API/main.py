from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.verificar_login import verificar_usuario
from backend.consultar_vaca import obtener_datos_vaca_con_notas

app = FastAPI()

class Credenciales(BaseModel):
    cedula: str
    contrasena: str

@app.get("/")
def root():
    return {"mensaje": "API activa y funcionando correctamente ✅"}

@app.post("/login")
def login(data: Credenciales):
    resultado = verificar_usuario(data.cedula, data.contrasena)

    if not resultado["ok"]:
        raise HTTPException(status_code=401, detail=resultado["error"])

    return {
        "ok": True,
        "usuario": resultado["usuario"]
    }

@app.get("/vaca/{vaca_id}")
def obtener_vaca(vaca_id: int):
    datos = obtener_datos_vaca_con_notas(vaca_id)
    if datos:
        return {"ok": True, "datos": datos}
    else:
        return {"ok": False, "mensaje": "Vaca no encontrada"}