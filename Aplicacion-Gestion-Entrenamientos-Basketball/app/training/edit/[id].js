// app/training/edit/[id].js
import { useEffect, useState } from "react";
import {View,Text,TextInput,ScrollView,Pressable,ActivityIndicator,Alert,Platform,StyleSheet} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { teamStyles as styles } from "../../../components/stylesTeams";
import { updateTraining, getUserExercises } from "../../../lib/queries";

const COURT_OPTIONS = [
  { value: "full", label: "Pista completa" },
  { value: "half", label: "Media pista" },
  { value: "none", label: "Sin pista" },
];

export default function EditTraining() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [players, setPlayers] = useState("");
  const [courtValue, setCourtValue] = useState(null);
  const [courtLabel, setCourtLabel] = useState("");
  const [description, setDescription] = useState("");

  // ejercicios
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [allExercises, setAllExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);

  // Cargar entrenamiento inicial
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("No se pudo cargar el entrenamiento");
      } else if (data) {
        setDate(data.date || "");
        setDuration(
          data.duration?.toString?.() ||
            data.duration_minutes?.toString?.() ||
            ""
        );
        setPlayers(
          data.players?.toString?.() ||
            data.players_count?.toString?.() ||
            ""
        );

        const court = data.court || null;
        const courtOpt =
          COURT_OPTIONS.find(
            (o) => o.value === court || o.label === court
          ) || null;

        setCourtValue(courtOpt?.value || null);
        setCourtLabel(courtOpt?.label || "");
        setDescription(data.description || "");

        // ids de ejercicios guardados
        if (Array.isArray(data.exercises)) {
          setSelectedExerciseIds(data.exercises);
        } else {
          setSelectedExerciseIds([]);
        }
      }

      setLoading(false);
    })();
  }, [id]);

  // Cargar todos los ejercicios
  const loadExercises = async () => {
    setLoadingExercises(true);
    const { data, error } = await getUserExercises();

    if (error) return;

    setAllExercises(data);
    setLoadingExercises(false);
  };

  // Sincronizar tarjetas seleccionadas a partir de los ids
  useEffect(() => {
    if (allExercises.length > 0) {
      setSelectedExercises(
        allExercises.filter((ex) => selectedExerciseIds.includes(ex.id))
      );
    } else {
      setSelectedExercises([]);
    }
  }, [allExercises, selectedExerciseIds]);

  const openExercisePicker = async () => {
    if (allExercises.length === 0) {
      await loadExercises();
    }
    setExercisePickerOpen(true);
  };

  const closeExercisePicker = () => {
    setExercisePickerOpen(false);
  };

  const toggleExercise = (eid) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(eid) ? prev.filter((x) => x !== eid) : [...prev, eid]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      if (!date || !duration) {
        setError("Fecha y duración son obligatorias.");
        return;
      }

      const payload = {
        id: id,
        date: date.trim(),
        description: description.trim() || null,
      };

      const durNum = Number(duration);
      const playersNum = players === "" ? null : Number(players);

      payload.duration = isNaN(durNum) ? null : durNum;
      payload.players = isNaN(playersNum) ? null : playersNum;

      payload.court = courtValue || null;

      const { error } = await updateTraining({training: payload, exercises: selectedExerciseIds});
      if (error) throw error;

      Alert.alert(
        "✅ Entrenamiento actualizado",
        "Los cambios se guardaron correctamente",
        [{ text: "OK", onPress: () => router.replace("/entrenamientos") }]
      );
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // quitar un ejercicio de la lista seleccionada
  const handleRemoveExercise = (idEx) => {
    setSelectedExerciseIds((prev) => prev.filter((e) => e !== idEx));
  };

  if (loading)
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </View>
    );

  // ----- MODO PICKER EJERCICIOS -----
  if (exercisePickerOpen) {
    return (
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 10,
          backgroundColor: "#f6f7fb",
        }}
      >
        <Stack.Screen
          options={{
            headerTitle: "Seleccionar ejercicios",
            headerTintColor: "#000",
          }}
        />

        <Text style={styles.modalTitle}>Seleccionar ejercicios</Text>
        <Text style={styles.modalSubtitle}>
          Toca las cartas para seleccionarlas o deseleccionarlas.
        </Text>
        <Text style={{ color: "#111827", fontSize: 13, marginBottom: 8 }}>
          Seleccionados: {selectedExerciseIds.length}
        </Text>

        {loadingExercises ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : allExercises.length === 0 ? (
          <Text style={{ color: "#4b5563", marginTop: 12 }}>
            Aún no has creado ejercicios.
          </Text>
        ) : (
          allExercises.map((item) => {
            const selected = selectedExerciseIds.includes(item.id);
            const durationLabel = item.duration
              ? `${item.duration} min`
              : "-";
            const playersLabel =
              item.players != null && item.players !== ""
                ? String(item.players)
                : "-";
            const courtLabel = item.court
              ? {
                  full: "Pista completa",
                  half: "Media pista",
                  none: "Sin pista",
                }[item.court] || item.court
              : "Sin pista";
            const typeLabel = item.type || "Ejercicio";

            return (
              <Pressable
                key={item.id}
                onPress={() => toggleExercise(item.id)}
                style={[
                  pickerStyles.card,
                  selected && pickerStyles.cardSelected,
                ]}
              >
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingTop: 10,
                    paddingBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    {typeLabel}
                  </Text>
                </View>

                <View style={pickerStyles.statsRow}>
                  <View style={pickerStyles.statCard}>
                    <Text style={pickerStyles.statLabel}>Duración</Text>
                    <Text style={pickerStyles.statValue}>
                      {durationLabel}
                    </Text>
                  </View>
                  <View style={pickerStyles.statCard}>
                    <Text style={pickerStyles.statLabel}>Jugadores</Text>
                    <Text style={pickerStyles.statValue}>
                      {playersLabel}
                    </Text>
                  </View>
                  <View style={pickerStyles.statCard}>
                    <Text style={pickerStyles.statLabel}>Pista</Text>
                    <Text style={pickerStyles.statValue}>
                      {courtLabel}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}

        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Pressable
            style={[styles.lightButton, { flex: 1 }]}
            onPress={closeExercisePicker}
          >
            <Text style={styles.lightText}>Volver</Text>
          </Pressable>

          <Pressable
            style={[styles.darkButton, { flex: 1 }]}
            onPress={closeExercisePicker}
          >
            <Text style={styles.darkText}>Añadir ejercicios</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ----- MODO FORMULARIO NORMAL -----
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        gap: 10,
        backgroundColor: "#f6f7fb",
      }}
    >
      <Stack.Screen
        options={{
          headerTitle: "Editar entrenamiento",
          headerTintColor: "#000",
        }}
      />

      <Text style={styles.modalTitle}>Editar entrenamiento</Text>
      <Text style={styles.modalSubtitle}>
        Actualiza la información del entrenamiento
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Fecha (dd/mm/aaaa --:--:--)"
        placeholderTextColor="#9ca3af"
        value={date}
        onChangeText={setDate}
        keyboardType="numbers-and-punctuation"
      />

      <TextInput
        style={styles.input}
        placeholder="Duración (minutos)"
        placeholderTextColor="#9ca3af"
        keyboardType="number-pad"
        value={duration}
        onChangeText={setDuration}
      />

      <TextInput
        style={styles.input}
        placeholder="Número de jugadores"
        placeholderTextColor="#9ca3af"
        keyboardType="number-pad"
        value={players}
        onChangeText={setPlayers}
      />

      <Dropdown
        label="Pista disponible"
        placeholder="Seleccionar disponibilidad"
        value={courtLabel}
        options={COURT_OPTIONS}
        onSelect={(opt) => {
          setCourtValue(opt.value);
          setCourtLabel(opt.label);
        }}
      />

      {/* ---------- EJERCICIOS SELECCIONADOS ---------- */}
      <View style={exerciseBoxStyles.container}>
        <Text style={exerciseBoxStyles.title}>Ejercicios seleccionados</Text>

        {selectedExercises.length === 0 ? (
          <>
            <Text style={exerciseBoxStyles.subtitle}>
              Todavía no has añadido ejercicios a este entrenamiento.
            </Text>
            <Pressable
              style={exerciseBoxStyles.selectButton}
              onPress={openExercisePicker}
            >
              <Text style={exerciseBoxStyles.selectButtonText}>
                Seleccionar ejercicios
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={exerciseBoxStyles.subtitle}>
              Has seleccionado {selectedExerciseIds.length} ejercicio(s).
            </Text>

            {selectedExercises.map((ex) => {
              const durationLabel = ex.duration ? `${ex.duration} min` : "-";
              const playersLabel =
                ex.players != null && ex.players !== ""
                  ? String(ex.players)
                  : "-";

              return (
                <Pressable
                  key={ex.id}
                  style={exerciseBoxStyles.card}
                  onPress={() => router.push(`/exercise/${ex.id}`)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={exerciseBoxStyles.cardTitle}>{ex.name}</Text>
                    <Text style={exerciseBoxStyles.cardMeta}>
                      {durationLabel} · {playersLabel} jugadores
                    </Text>
                    {ex.type ? (
                      <Text style={exerciseBoxStyles.cardType}>{ex.type}</Text>
                    ) : null}
                  </View>

                  <Pressable
                    style={exerciseBoxStyles.removePill}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleRemoveExercise(ex.id);
                    }}
                  >
                    <Text style={exerciseBoxStyles.removePillText}>Quitar</Text>
                  </Pressable>
                </Pressable>
              );
            })}

            <Pressable
              style={[exerciseBoxStyles.selectButton, { marginTop: 8 }]}
              onPress={openExercisePicker}
            >
              <Text style={exerciseBoxStyles.selectButtonText}>
                Añadir / modificar ejercicios
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* ---------- DESCRIPCIÓN ---------- */}
      <TextInput
        style={[
          styles.input,
          { height: 100, textAlignVertical: "top", marginTop: 8 },
        ]}
        placeholder="Descripción / ejercicios"
        placeholderTextColor="#9ca3af"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
        <Pressable
          style={[styles.lightButton, { flex: 1 }]}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.lightText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[
            styles.darkButton,
            { flex: 1, opacity: saving ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.darkText}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* ----- Dropdown simple ----- */
function Dropdown({ label, placeholder, value, options, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={localStyles.dropdownTrigger}
      >
        <Text
          style={{
            color: value ? "#111827" : "#9ca3af",
            fontSize: 14,
          }}
        >
          {value || placeholder}
        </Text>
      </Pressable>

      {open && (
        <View style={localStyles.dropdownMenu}>
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              style={localStyles.dropdownItem}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text style={{ color: "#111827" }}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    backgroundColor: "#f9fafb",
    marginTop: 4,
  },
  dropdownMenu: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

const pickerStyles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: "#16a34a",
    borderWidth: 2,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbf7fbff",
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
});

const exerciseBoxStyles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1d4ed8",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 8,
  },
  selectButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f97316",
    alignItems: "center",
    marginTop: 4,
  },
  selectButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  cardMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cardType: {
    fontSize: 11,
    color: "#6b21a8",
    marginTop: 2,
  },
  removePill: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  removePillText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
});
