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
}
    from "../../lib/api";

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

    // Cargar inseminadores del tambo
    useEffect(() => {
        let cancelado = false;

        (async () => {
            if (!user?.token) return;

            setCargandoInsem(true);
            setErrorInsem("");

            try {
                const resp = await obtenerInseminadoresPorTambo({
                    tambo_id: Number(tamboId),
                    token: user?.token,
                });
                if (cancelado) return;

                const lista = Array.isArray(resp?.inseminadores) ? resp.inseminadores : [];
                setListaInsem(lista);
                setErrorInsem("");

                if (lista.length === 1) {
                    // ✅ Autoseleccionar el único
                    setSelectedInsemId(lista[0].id);
                    setInseminador(lista[0].nombre);
                } else {
                    // ✅ 0 o >1: campo vacío
                    setSelectedInsemId(null);
                    setInseminador("");
                }
            } catch (e) {
                if (!cancelado) setErrorInsem(e?.message || "Error de conexión al cargar inseminadores.");
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

    // 👇 agregá esta constante justo antes del return, donde calculás cosas como historialMostrar
    const deshabilitarAceptar = !fecha || !selectedInsemId;

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
                    onPress={() => setShowFechaPicker((s) => !s)}
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
            <View style={styles.inputRow}>
                <TouchableOpacity
                    style={[styles.inputBox, { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}
                    onPress={() => {
                        if (listaInsem.length > 1) setModalInseminador(true);
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: selectedInsemId ? "#000" : "#888" }}>
                        {selectedInsemId ? inseminador : "Elegir inseminador"}
                    </Text>
                    <Text style={{ color: "#aaa", fontSize: 16 }}>›</Text>
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
                            listaInsem.map((op) => {
                                const isSelected = selectedInsemId === op.id;
                                return (
                                    <TouchableOpacity
                                        key={op.id}
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setSelectedInsemId(op.id);
                                            setInseminador(op.nombre);
                                            setModalInseminador(false);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.modalItemText,
                                                isSelected && styles.modalItemSelected,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {op.nombre}
                                        </Text>

                                        {/* check de selección */}
                                        <Text style={[styles.modalItemText, { color: isSelected ? "#086b39" : "transparent" }]}>
                                            ✓
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        )}

                        <TouchableOpacity
                            onPress={() => setModalInseminador(false)}
                            style={styles.modalClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalCloseText}>Cerrar</Text>
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
                {/* Aceptar */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    // si está deshabilitado, no dispara onPress
                    onPress={deshabilitarAceptar ? undefined : onAceptar}
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: deshabilitarAceptar ? "#9cccaa" : "#086b39",
                        },
                    ]}
                >
                    <Text style={styles.actionButtonText}>Aceptar</Text>
                </TouchableOpacity>

                {/* Cancelar */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.back()}
                    style={[
                        styles.actionButton,
                        { backgroundColor: "#ddd" },
                    ]}
                >
                    <Text style={[styles.actionButtonText, { color: "#000" }]}>
                        Cancelar
                    </Text>
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
    // Fondo desenfocado
    // modalOverlay: {
    //     flex: 1,
    //     backgroundColor: "rgba(0,0,0,0.35)",
    //     justifyContent: "center",
    //     alignItems: "center",
    //     padding: 20,
    // },

    // Tarjeta
    // modalCard: {
    //     width: "100%",
    //     maxWidth: 520,
    //     backgroundColor: "#fff",
    //     borderRadius: 12,
    //     paddingHorizontal: 14,
    //     paddingTop: 14,
    //     paddingBottom: 8,
    //     shadowColor: "#000",
    //     shadowOpacity: 0.15,
    //     shadowOffset: { width: 0, height: 8 },
    //     shadowRadius: 16,
    //     elevation: 8,
    // },

    // modalTitle: {
    //     fontSize: 17,
    //     fontWeight: "700",
    //     color: "#000",
    //     marginBottom: 8,
    // },

    // Lista con límite de alto (scroll)
    modalList: {
        maxHeight: "60%", // evita que tape toda la pantalla si hay muchos
    },

    modalMuted: {
        color: "#666",
        fontSize: 14,
        paddingVertical: 10,
        paddingHorizontal: 4,
    },

    // Ítem
    // modalItem: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     justifyContent: "space-between",
    //     paddingVertical: 12,
    //     paddingHorizontal: 4,
    //     borderBottomWidth: StyleSheet.hairlineWidth,
    //     borderBottomColor: "#eee",
    // },

    // modalItemSelected: {
    //     backgroundColor: "#f1f8f3", // leve highlight
    //     borderRadius: 8,
    // },

    // modalItemText: {
    //     color: "#111",
    //     fontSize: 16,
    // },

    modalItemTextSelected: {
        fontWeight: "600",
        color: "#086b39",
    },

    modalCheck: {
        fontSize: 16,
        color: "#086b39",
        marginLeft: 10,
    },

    // Footer
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingTop: 6,
    },

    modalGhostBtn: {
        paddingVertical: 10,
        paddingHorizontal: 6,
    },

    modalGhostText: {
        color: "#888",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
      },
      modalCard: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      },
      modalTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#000",
        textAlign: "center",
      },
      modalItem: {
        paddingVertical: 12,
        borderBottomColor: "#f0f0f0",
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
      modalItemText: {
        fontSize: 15,
        color: "#000",
      },
      modalItemSelected: {
        color: "#086b39",
        fontWeight: "600",
      },
      modalClose: {
        marginTop: 10,
        alignSelf: "flex-end",
      },
      modalCloseText: {
        color: "#888",
        fontSize: 14,
      }
});