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
  
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error en loginUsuario:', err);
      return { ok: false, error: 'Error de conexión con el servidor' };
    }
  }