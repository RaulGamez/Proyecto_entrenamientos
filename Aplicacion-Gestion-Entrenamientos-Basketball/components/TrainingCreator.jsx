// components/TrainingCreator.jsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Platform, ActivityIndicator, ScrollView, StyleSheet} from "react-native";
import { supabase } from "../lib/supabase";
import { useUser } from "../contexts/UserContexts";
import { styles as baseStyles } from "./styles";
import { createTraining, getUserExercises } from "../lib/queries";
import { useRouter } from "expo-router";


const COURT_OPTIONS = [
  { value: "full", label: "Pista completa" },
  { value: "half", label: "Media pista" },
  { value: "quarter", label: "1/4 pista" },
  { value: "none", label: "Sin pista" },
];


export function TrainingCreator({ onClose, onCreated, onGoToExercisesTab }) {
  const { user, loading } = useUser();
  const router = useRouter();

  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [players, setPlayers] = useState("");
  const [description, setDescription] = useState("");

  // equipo
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [teamLabel, setTeamLabel] = useState("");

  // pista
  const [courtValue, setCourtValue] = useState(null);
  const [courtLabel, setCourtLabel] = useState("");

  // --- ejercicios seleccionables ---
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [allExercises, setAllExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);

  // cargar equipos de Supabase
  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase.from("teams").select("id, name");
      if (!error && data) {
        setTeams(data);
      }
    };
    fetchTeams();
  }, []);

  const loadExercises = async () => {
    setLoadingExercises(true);
    const { data, error } = await getUserExercises();

    if (error) return;
    setAllExercises(data);

    setLoadingExercises(false);
  };

  // Cada vez que cambien los IDs seleccionados o la lista completa,
  // recalculamos las tarjetas que se muestran en el formulario.
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

  const toggleExercise = (id) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleRemoveExercise = (id) => {
    setSelectedExerciseIds((prev) => prev.filter((e) => e !== id));
  };

  const handleCreateTraining = async () => {
    setError("");

    if (!date || !duration || !teamId) {
      setError("Rellena fecha, equipo y duración.");
      return;
    }

    try {
      setSaveLoading(true);

      const durationNum = Number(duration);
      const playersNum = players === "" ? null : Number(players);

      const payload = {
        date: date.trim(), // Postgres acepta string si es formato válido
        team_id: teamId === "none" ? null : teamId,
        duration: isNaN(durationNum) ? null : durationNum,
        players: isNaN(playersNum) ? null : playersNum,
        court: courtValue || null,
        description: description.trim() || null, // OJO: columna con typo                      // de momento vacío
        created_by: user?.id || null,
      };

      const { error } = await createTraining({training: payload, exercises: selectedExerciseIds});

      if (error) throw error;

      onCreated?.();
    } catch (e) {
      console.error("Error creando entrenamiento", e);
      setError(e.message || "No se pudo crear el entrenamiento");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 24, alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const teamOptions = [
    { value: "none", label: "Sin equipo" },
    ...teams.map((t) => ({ value: t.id, label: t.name })),
  ];

   // ----- MODO PICKER DE EJERCICIOS -----
  if (exercisePickerOpen) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Text style={baseStyles.sectionTitle}>Seleccionar ejercicios</Text>
        <Text style={{ color: "#111827", fontSize: 13, marginBottom: 8 }}>
          Seleccionados: {selectedExerciseIds.length}
        </Text>

        {loadingExercises ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : allExercises.length === 0 ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: "#4b5563", fontSize: 13 }}>
              Aún no has creado ningún ejercicio.
            </Text>
            {onGoToExercisesTab ? (
              <Pressable
                style={[baseStyles.darkButton, { marginTop: 10 }]}
                onPress={onGoToExercisesTab}
              >
                <Text style={baseStyles.darkText}>
                  Ir a “Mis Ejercicios”
                </Text>
              </Pressable>
            ) : null}
          </View>
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
                  quarter: "1/4 pista",
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

        {/* Botón volver / añadir sin seleccionar más */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Pressable
            style={[baseStyles.lightButton, { flex: 1 }]}
            onPress={closeExercisePicker}
          >
            <Text style={baseStyles.lightText}>Volver</Text>
          </Pressable>

          <Pressable
            style={[baseStyles.darkButton, { flex: 1 }]}
            onPress={closeExercisePicker}
          >
            <Text style={baseStyles.darkText}>Añadir ejercicios</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ----- MODO FORMULARIO NORMAL -----
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={baseStyles.sectionTitle}>Crear nuevo entrenamiento</Text>

      {!!error && <Text style={{ color: "red" }}>{error}</Text>}

      <Label>Fecha *</Label>
      <Input
        placeholder="dd/mm/aaaa"
        value={date}
        onChangeText={setDate}
        keyboardType="numbers-and-punctuation"
      />

      <Label>Equipo *</Label>
      <Dropdown
        placeholder="Seleccionar equipo"
        value={teamLabel}
        options={teamOptions}
        onSelect={(opt) => {
          setTeamId(opt.value);
          setTeamLabel(opt.label);
        }}
      />

      <Label>Duración (minutos) *</Label>
      <Input
        placeholder="Ej: 90"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
      />

      <Label>Jugadores disponibles</Label>
      <Input
        placeholder="Número de jugadores"
        value={players}
        onChangeText={setPlayers}
        keyboardType="number-pad"
      />

      <Label>Pista disponible</Label>
      <Dropdown
        placeholder="Seleccionar disponibilidad"
        value={courtLabel}
        options={COURT_OPTIONS}
        onSelect={(opt) => {
          setCourtValue(opt.value);
          setCourtLabel(opt.label);
        }}
      />

      <Label>Descripción</Label>
      <Input
        placeholder="Notas adicionales sobre el entrenamiento"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* ---------- EJERCICIOS SELECCIONADOS ---------- */}
      <View style={exerciseBoxStyles.container}>
        <Text style={exerciseBoxStyles.title}>Ejercicios seleccionados</Text>

        {selectedExerciseIds.length === 0 ? (
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
                ex.players != null && ex.players !== "" ? String(ex.players) : "-";

              return (
                <Pressable
                  key={ex.id}
                  style={exerciseBoxStyles.card}
                  onPress={() => router.push(`/exercise/${ex.id}`)} // 👈 ver detalle
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

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        <Pressable
          style={[baseStyles.lightButton, { flex: 1 }]}
          onPress={onClose}
        >
          <Text style={baseStyles.lightText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[baseStyles.darkButton, { flex: 1 }]}
          onPress={handleCreateTraining}
          disabled={saveLoading}
        >
          {saveLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={baseStyles.darkText}>Crear Entrenamiento</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const Label = ({ children }) => (
  <Text style={{ color: "#6b7280", marginTop: 6, marginBottom: 4 }}>
    {children}
  </Text>
);

const Input = (props) => (
  <TextInput
    {...props}
    placeholderTextColor="#9ca3af"
    style={{
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === "ios" ? 12 : 10,
      backgroundColor: "#f9fafb",
      textAlignVertical: props.multiline ? "top" : "center",
    }}
  />
);

// Dropdown simple reutilizable
function Dropdown({ placeholder, value, options, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <View>
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
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
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
  exerciseButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  exerciseButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

const pickerStyles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: "#22c55e",
    borderWidth: 2,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfeff",
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
