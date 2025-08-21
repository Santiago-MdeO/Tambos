/* eslint-disable react/prop-types */
// app/inseminacion/[id].js
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
    obtenerVacaPorId,
    asignarInseminacion,
    obtenerHistorialInseminacion,
    obtenerInseminadoresPorTambo,
} from "../../lib/api";

export default function InseminacionScreen() {
    const router = useRouter();
    const { id, tamboId } = useLocalSearchParams(); // id = identificador vaca, tamboId = tambo
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [vaca, setVaca] = useState(null);
    const [error, setError] = useState("");

    // UI: ficha plegable
    const [expandFicha, setExpandFicha] = useState(false);

    // Programación
    const [fecha, setFecha] = useState(""); // YYYY-MM-DD
    const [showFechaPicker, setShowFechaPicker] = useState(false);

    // Inseminador
    const [listaInsem, setListaInsem] = useState([]);          // [{ id, nombre }]
    const [selectedInsemId, setSelectedInsemId] = useState(null); // id para backend
    const [inseminador, setInseminador] = useState("");        // nombre visible
    const [modalInseminador, setModalInseminador] = useState(false);
    const [cargandoInsem, setCargandoInsem] = useState(false);
    const [errorInsem, setErrorInsem] = useState("");

    // Historial
    const [historial, setHistorial] = useState([]);
    const [verTodoHistorial, setVerTodoHistorial] = useState(false);

    // Carga inicial
    useEffect(() => {
        (async () => {
            try {
                // Datos de la vaca (tambo + id)
                const v = await obtenerVacaPorId(tamboId, id);
                if (!v.ok) throw new Error(v.error || "No se pudo obtener la vaca");
                setVaca(v.datos.vaca);

                // Historial de inseminación (requiere token)
                const h = await obtenerHistorialInseminacion({
                    tambo_id: tamboId,
                    vaca_id: id,
                    token: user?.token,
                });
                if (h.ok) setHistorial(h.historial || []);
            } catch (e) {
                setError(e.message || "Error cargando datos");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, tamboId, user?.token]);

    // Carga inseminadores del tambo al entrar
    useEffect(() => {
        let cancelado = false;
        (async () => {
            if (!user?.token) return;         // nada que hacer sin token
            setCargandoInsem(true);
            setErrorInsem("");

            try {
                const resp = await obtenerInseminadoresPorTambo({
                    tambo_id: Number(tamboId),
                    token: user?.token,
                });

                if (cancelado) return;

                if (resp.ok) {
                    const lista = resp.inseminadores ?? [];
                    setListaInsem(lista);
                    setErrorInsem("");            // limpia error previo

                    // Autoseleccionar el primero (opcional)
                    if (lista.length) {
                        setSelectedInsemId(lista[0].id);
                        setInseminador(lista[0].nombre);
                    } else {
                        // Si no hay inseminadores, dejá campos limpios
                        setSelectedInsemId(null);
                        setInseminador("");
                    }
                } else {
                    setErrorInsem(resp.error || resp.detail || "No se pudieron cargar los inseminadores.");
                }
            } catch (e) {
                if (!cancelado) setErrorInsem(e.message || "Error de conexión al cargar inseminadores.");
            } finally {
                if (!cancelado) setCargandoInsem(false);
            }
        })();

        return () => { cancelado = true; };
    }, [tamboId, user?.token]);

    // Asegurá esta línea arriba del return (o donde armes los datos)
    const notasRelevantes = Array.isArray(vaca?.notas)
        ? vaca.notas.filter((n) => {
            const m = (n.motivo || "").toLowerCase();
            return m.includes("insemin") || m.includes("enfermed");
        })
        : [];

    // Loading / Error
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#176f3d" />
            </View>
        );
    }
    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: "red" }}>{error}</Text>
            </View>
        );
    }
    // Mostrar solo el último registro, o todo
    const historialMostrar = verTodoHistorial ? historial : historial.slice(0, 1);

    // Guardar asignación
    const onAceptar = async () => {
        if (!fecha) {
            return Alert.alert("Falta fecha", "Elegí la fecha de inseminación.");
        }
        if (!selectedInsemId) {
            return Alert.alert("Falta inseminador", "Elegí el inseminador.");
        }

        try {
            const resp = await asignarInseminacion({
                identificador_vaca: Number(id),
                tambo_id: Number(tamboId),
                fecha_inseminacion: fecha,             // "YYYY-MM-DD"
                inseminador_id: Number(selectedInsemId), // <-- ID del elegido
                token: user?.token,
            });

            if (resp.ok) {
                Alert.alert("Éxito", "Asignación registrada correctamente.", [
                    { text: "OK", onPress: () => router.back() },
                ]);
            } else {
                Alert.alert("Error", resp.detail || resp.error || "No se pudo registrar la asignación.");
            }
        } catch (error) {
            Alert.alert("Error", error?.message || "Problema de conexión con el servidor.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.screenTitle}>Inseminación</Text>

            {/* Ficha del animal (plegable) */}
            <View style={styles.card}>
                <TouchableOpacity
                    onPress={() => setExpandFicha((s) => !s)}
                    style={styles.cardHeader}
                    activeOpacity={0.8}
                >
                    <Text style={styles.cardTitle}>Ficha del animal</Text>
                    <Text style={styles.cardBadge}>UY {vaca.identificador}</Text>
                </TouchableOpacity>

                {expandFicha && (
                    <View style={{ marginTop: 10 }}>
                        <Info label="Raza / Cruza" value={vaca.raza_cruza} />
                        <Info label="Fecha de nacimiento" value={vaca.fecha_nacimiento} />
                        <Info label="Estado de salud" value={vaca.estado_salud} />
                        <Info label="Categoría" value={vaca.categoria} />
                        <Info label="Sexo" value={vaca.sexo} />
                        <Info label="Castrado" value={vaca.castrado ? "Sí" : "No"} />
                        <Info label="Ingreso" value={vaca.fecha_ingreso_sistema} />
                    </View>
                )}
            </View>

            {/* Programación */}
            <Text style={styles.sectionTitle}>Programación</Text>

            {/* Fecha */}
            <View style={styles.inputRow}>
                <TouchableOpacity
                    style={[styles.inputBox, { flex: 1 }]}
                    onPress={() => setShowFechaPicker(true)}
                >
                    <Text style={{ color: fecha ? "#000" : "#888" }}>
                        {fecha || "Fecha de inseminación (YYYY-MM-DD)"}
                    </Text>
                </TouchableOpacity>
            </View>

            {showFechaPicker && (
                <DateTimePicker
                    value={fecha ? new Date(fecha) : new Date()}
                    mode="date"
                    // iOS muestra el calendario grande; Android abre diálogo.
                    display={
                        Platform.OS === "ios"
                            ? (Platform.Version >= 14 ? "inline" : "spinner")
                            : "calendar"
                    }
                    onChange={(event, selectedDate) => {
                        // ANDROID: event.type = 'set' (eligió) o 'dismissed' (cerró)
                        // iOS (inline): dispara onChange al tocar un día
                        if (selectedDate) {
                            const yyyyMmDd = new Date(
                                selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
                            )
                                .toISOString()
                                .split("T")[0];
                            setFecha(yyyyMmDd);
                        }
                        // 👇 cerrar SIEMPRE después de cualquier interacción
                        setShowFechaPicker(false);
                    }}
                />
            )}

            {/* Inseminador (selector minimalista con modal) */}
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.inputBox, { flex: 1 }]}
                    onPress={() => setModalInseminador(true)}
                >
                    <Text style={{ color: inseminador ? "#000" : "#888" }}>
                        {inseminador || "Elegir inseminador"}
                    </Text>
                </TouchableOpacity>
            </View>

            {errorInsem ? (
                <Text style={[styles.errorText, { marginTop: 6 }]}>{errorInsem}</Text>
            ) : null}

            <Modal
                visible={modalInseminador}
                transparent
                animationType="fade"
                onRequestClose={() => setModalInseminador(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Seleccioná inseminador</Text>

                        {cargandoInsem ? (
                            <Text style={{ color: "#666", marginTop: 8 }}>Cargando…</Text>
                        ) : listaInsem.length === 0 ? (
                            <Text style={{ color: "#666", marginTop: 8 }}>
                                No hay inseminadores para este tambo
                            </Text>
                        ) : (
                            listaInsem.map((op) => (
                                <TouchableOpacity
                                    key={op.id}                      // <- key estable
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setSelectedInsemId(op.id);   // ← ID numérico para backend
                                        setInseminador(op.nombre);   // ← texto visible
                                        setModalInseminador(false);
                                    }}
                                >
                                    <Text style={{ color: "#000" }}>{op.nombre}</Text>
                                </TouchableOpacity>
                            ))
                        )}

                        <TouchableOpacity onPress={() => setModalInseminador(false)} style={{ marginTop: 8 }}>
                            <Text style={{ textAlign: "right", color: "#888" }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Historial de inseminación */}
            <Text style={styles.sectionTitle}>Historial de inseminación</Text>
            {historialMostrar.length === 0 ? (
                <Text style={styles.emptyText}>Sin registros.</Text>
            ) : (
                historialMostrar.map((h, idx) => (
                    <View key={`${h.fecha_asignacion}-${idx}`} style={styles.historyItem}>
                        <Text style={styles.historyText}>
                            Asignación: {h.fecha_asignacion?.slice(0, 10)} — Insem.: {h.fecha_inseminacion}
                        </Text>
                        <Text style={styles.historyMeta}>
                            Inseminador: {h.nombre_inseminador} ({h.rol_inseminador})
                        </Text>
                        <Text style={styles.hSmall}>
                            Resultado: {h.resultado ?? "Pendiente"}
                        </Text>
                    </View>
                ))
            )}
            {historial.length > 1 && (
                <TouchableOpacity onPress={() => setVerTodoHistorial((v) => !v)}>
                    <Text style={styles.historyLink}>
                        {verTodoHistorial ? "Ver menos" : "Ver historial completo"}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Notas relevantes */}
            <Text style={styles.sectionTitle}>Notas relevantes</Text>

            {notasRelevantes.length === 0 ? (
                <Text style={styles.noteEmptyText}>
                    No hay notas de inseminación o enfermedades.
                </Text>
            ) : (
                notasRelevantes.slice(0, 3).map((n, i) => (
                    <View
                        key={n._id ?? `${i}-${n.fecha_creacion}`}
                        style={styles.noteCard}
                    >
                        <Text style={{ color: "#000" }}>{n.contenido}</Text>
                        <Text style={styles.noteMeta}>
                            {n.autor} — {n.rol} | {n.fecha_creacion}
                        </Text>
                    </View>
                ))
            )}

            {/* Acciones */}
            <View style={{ height: 16 }} />
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#086b39" }]}
                    onPress={onAceptar}
                >
                    <Text style={styles.actionButtonText}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#086b39" }]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.actionButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 24 }} />
        </ScrollView>
    );

    function Info({ label, value }) {
        return (
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    // ====== Layout General ======
    container: {
        padding: 20,
        backgroundColor: "#FCFAF5"
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FCFAF5",
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#000"
    },

    // ====== Tarjetas (ficha, historial, notas) ======
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 14,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#222"
    },
    cardBadge: {
        backgroundColor: "#e4f6e4",
        borderRadius: 14,
        paddingVertical: 4,
        paddingHorizontal: 10,
        fontWeight: "600",
        color: "#086b39",
    },

    // Historial
    historyItem: {
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#eee",
        padding: 10,
        marginBottom: 10,
    },
    historyText: {
        color: "#000"
    },
    historyMeta: {
        color: "#555",
        fontSize: 12,
        marginTop: 2
    },
    historyLink: {
        color: "#086b39",
        fontSize: 14,
        fontWeight: "500",
        marginTop: 4,
        marginBottom: 12,
        textAlign: "center",
    },

    // Notas
    noteEmptyText: {
        color: "#666",
        fontStyle: "italic"
    },
    noteCard: {
        backgroundColor: "#e4f6e4",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    noteMeta: {
        color: "#555",
        fontSize: 12,
        marginTop: 4,
        fontStyle: "italic"
    },

    // ====== Info (rows y labels) ======
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    infoLabel: {
        fontWeight: "bold",
        color: "#333"
    },
    infoValue: {
        color: "#555"
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
        marginBottom: 10,
        color: "#222"
    },

    // ====== Inputs & Selectores ======
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    inputBox: {
        backgroundColor: "#fff",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },

    // ====== Modal Inseminador ======
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCard: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
    },
    modalTitle: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 8,
        color: "#000"
    },
    modalItem: {
        paddingVertical: 10,
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
    },

    // ====== Acciones (botones y filas) ======
    actionRow: {
        flexDirection: "row",
        gap: 10
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    },

    // ====== Estados ======
    errorText: {
        color: "#b00020",
        fontSize: 13
    },
});