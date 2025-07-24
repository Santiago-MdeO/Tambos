# backend/auth.py
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Clave secreta para firmar los tokens
SECRET_KEY = "zephira_super_secreta"  # (esto deberías guardar en un .env)
ALGORITHM = "HS256"
EXPIRACION_MINUTOS = 60 * 24  # 24h

def crear_token(datos: dict):
    datos_a_codificar = datos.copy()
    expiracion = datetime.utcnow() + timedelta(minutes=EXPIRACION_MINUTOS)
    datos_a_codificar.update({"exp": expiracion})
    token = jwt.encode(datos_a_codificar, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verificar_token(token: str):
    try:
        datos = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return datos  # contiene lo que codificaste
    except JWTError:
        return None