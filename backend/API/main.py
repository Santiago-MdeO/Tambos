from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"mensaje": "API activa y funcionando correctamente ✅"}

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.verificar_login import verificar_usuario  # Ruta según tu estructura

app = FastAPI()

class Credenciales(BaseModel):
    cedula: str
    contrasena: str

@app.post("/login")
def login(data: Credenciales):
    resultado = verificar_usuario(data.cedula, data.contrasena)

    if not resultado["ok"]:
        raise HTTPException(status_code=401, detail=resultado["error"])
    
    return {
        "ok": True,
        "usuario": resultado["usuario"]
    }

@app.get("/")
def root():
    return {"mensaje": "API activa y funcionando correctamente ✅"}