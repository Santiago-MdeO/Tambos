// lib/api.js
const BASE_URL = "https://df2607f0f141.ngrok-free.app"; // ← actualizá si cambia tu ngrok

// Helper genérico con manejo de JSON, errores y timeout opcional
async function http(path, { method = "GET", headers = {}, body, timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      return { ok: false, error: `Respuesta no válida (HTTP ${res.status})` };
    }

    if (!res.ok || data?.ok === false) {
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }
    return data ?? { ok: false, error: "Respuesta vacía del servidor" };
  } catch (err) {
    if (err?.name === "AbortError") return { ok: false, error: "Tiempo de espera agotado" };
    return { ok: false, error: "Error de conexión con el servidor" };
  } finally {
    clearTimeout(id);
  }
}

/** 1) Login */
export async function loginUsuario(cedula, contrasena) {
  return http("/login", {
    method: "POST",
    body: { cedula, contrasena },
  });
}

/** 2) Datos totales de una vaca (tamboId + vacaId) */
export async function obtenerVacaPorId(tamboId, vacaId) {
  return http(`/vaca/${encodeURIComponent(tamboId)}/${encodeURIComponent(vacaId)}`);
}

/** 3) Crear nota (requiere token)
 * Compatibilidad:
 *  - crearNota(vaca_id, contenido, motivo, token)
 *  - crearNota({ vaca_id, contenido, motivo, usuario_id, token })
 */
export async function crearNota(a, b, c, d) {
  // Soporte parámetros posicionales previos
  if (typeof a !== "object") {
    const vaca_id = a;
    const contenido = b;
    const motivo = c;
    const token = d;
    return http("/nota", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: { vaca_id, contenido, motivo },
    });
  }
  // Soporte objeto
  const { vaca_id, contenido, motivo, usuario_id, token } = a;
  const body = { vaca_id, contenido, motivo };
  if (usuario_id != null) body.usuario_id = usuario_id;
  return http("/nota", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
}

/** 4) Asignar inseminación (requiere token)
 * Body esperado:
 * { identificador_vaca, tambo_id, fecha_inseminacion, inseminador_id }
 */
// lib/api.js
export async function asignarInseminacion({
  identificador_vaca,
  tambo_id,
  fecha_inseminacion,   // "YYYY-MM-DD"
  inseminador_id,       // número
  token,
}) {
  const body = {
    identificador_vaca: Number(identificador_vaca),
    tambo_id: Number(tambo_id),
    fecha_inseminacion,                 // ya en "YYYY-MM-DD"
    inseminador_id: Number(inseminador_id),
  };

  const res = await fetch(`${BASE_URL}/asignar-inseminacion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,   // obligatorio
    },
    body: JSON.stringify(body),
  });

  // Si falla, mostramos el detalle de FastAPI (ayuda muchísimo con 422)
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `HTTP ${res.status}`, detail: text };
  }
  return res.json();
}

/** 5) Historial de inseminación (tambo_id + vaca_id) (requiere token) */
export async function obtenerHistorialInseminacion({ tambo_id, vaca_id, token }) {
  return http(
    `/historial-inseminacion/${encodeURIComponent(tambo_id)}/${encodeURIComponent(vaca_id)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/** 6) Actualizar resultado de inseminación (PUT, requiere token)
 * Body esperado: { id_asignacion, resultado }
 */
/** Actualizar resultado de inseminación (PUT) */
/** Actualizar resultado de inseminación (PUT) */
export async function actualizarResultadoInseminacion({ id_asignacion, resultado, token }) {
  return http("/resultado-inseminacion", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", // ✅ importante para PUT con body
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_asignacion,
      resultado,
    }),
  });
}

// 🔹 Traer inseminadores del tambo (requiere token)
export async function obtenerInseminadoresPorTambo({ tambo_id, token }) {
  try {
    const res = await fetch(`https://df2607f0f141.ngrok-free.app/inseminadores/${encodeURIComponent(tambo_id)}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    // si tu backend responde siempre JSON:
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      // devuelve shape uniforme
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }

    // 🔎 Esperado: { ok:true, inseminadores: [ {id:<num>, nombre:<string>} ] }
    if (!data?.ok) return { ok: false, error: data?.error || "Respuesta inválida" };

    // Normalizamos por las dudas
    const lista = Array.isArray(data.inseminadores)
      ? data.inseminadores.map((it) => ({ id: Number(it.id), nombre: String(it.nombre) }))
      : [];

    return { ok: true, inseminadores: lista };
  } catch (e) {
    console.error("obtenerInseminadoresPorTambo:", e);
    return { ok: false, error: "Error de conexión con el servidor" };
  }
}