export async function loginUsuario(cedula, contrasena) {
  try {
    const res = await fetch("https://44d3b06942f8.ngrok-free.app/login", {
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
      const res = await fetch("https://44d3b06942f8.ngrok-free.app/vaca/${id}");
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