export async function loginUsuario(cedula, contrasena) {
  try {
    const res = await fetch("https://40d95361ca3f.ngrok-free.app/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cedula,
        contrasena,
      }),
    });

    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    } else {
      throw new Error("La respuesta no es JSON válida");
    }
  } catch (err) {
    console.error("Error en loginUsuario:", err);
    return { ok: false, error: "Error de conexión o respuesta inválida del servidor" };
  }
}

  export async function obtenerVacaPorId(id) {
    try {
      const res = await fetch(`https://40d95361ca3f.ngrok-free.app/vaca/${id}`);
      const data = await res.json();
  
      if (data.ok) {
        return data;
      } else {
        return { ok: false, error: 'Animal no encontrado' };
      }
  
    } catch (err) {
      console.error('Error al obtener datos de la vaca:', err);
      return { ok: false, error: 'Error de conexión' };
    }
  }

  export async function crearNota(vaca_id, contenido, motivo, token) {
    try {
      const res = await fetch('https://40d95361ca3f.ngrok-free.app/nota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vaca_id,
          contenido,
          motivo,
        }),
      });
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error al crear nota:', error);
      return { ok: false, error: 'No se pudo enviar la nota' };
    }
  }