// components/TrainingCreator.jsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Platform, ActivityIndicator, ScrollView, StyleSheet} from "react-native";
import { supabase } from "../lib/supabase";
import { useUser } from "../contexts/UserContexts";
import { styles as baseStyles } from "./styles";

const COURT_OPTIONS = [
  { value: "full", label: "Pista completa" },
  { value: "half", label: "Media pista" },
  { value: "quarter", label: "1/4 pista" },
  { value: "none", label: "Sin pista" },
];


export function TrainingCreator({ onClose, onCreated, onGoToExercisesTab }) {
  const { user, loading } = useUser();

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
        description: description.trim() || null, // OJO: columna con typo
        exercices: null,                          // de momento vacío
        created_by: user?.id || null,
      };

      const { data, error } = await supabase
        .from("trainings")
        .insert(payload)
        .select("*")
        .single();

      if (error) throw error;

      onCreated?.(data);
    } catch (e) {
      console.error("Error creando entrenamiento", e);
      setError(e.message || "No se pudo crear el entrenamiento");
    } finally {
      setSaveLoading(false);
    }
  };

  const teamOptions = [
    { value: "none", label: "Sin equipo" },
    ...teams.map((t) => ({ value: t.id, label: t.name })),
  ];

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

      <Label>Ejercicios del entrenamiento</Label>
      <Pressable
        style={localStyles.exerciseButton}
        onPress={onGoToExercisesTab}
      >
        <Text style={localStyles.exerciseButtonText}>
          + Añadir ejercicios al entrenamiento
        </Text>
      </Pressable>

      <Label>Descripción</Label>
      <Input
        placeholder="Notas adicionales sobre el entrenamiento"
        value={description}
        onChangeText={setDescription}
        multiline
      />

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