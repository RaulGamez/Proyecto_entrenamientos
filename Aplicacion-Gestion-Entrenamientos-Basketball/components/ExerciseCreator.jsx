// components/ExerciseCreator.jsx
import { useEffect, useState } from "react";
import {View, Text, TextInput, Pressable, Platform, ActivityIndicator, ScrollView, StyleSheet} from "react-native";
import { supabase } from "../lib/supabase";
import { useUser } from "../contexts/UserContexts";
import { styles as baseStyles } from "./styles";
import { createExercise } from "../lib/queries";

const COURT_OPTIONS = [
  { value: "full", label: "Pista completa" },
  { value: "half", label: "Media pista" },
  { value: "quarter", label: "1/4 pista" },
  { value: "none", label: "Sin pista" },
];

const EXERCISE_TYPES = [
  { value: "shooting", label: "Tiro" },
  { value: "dribbling", label: "Bote / manejo" },
  { value: "passing", label: "Pase" },
  { value: "defense", label: "Defensa" },
  { value: "warmup", label: "Calentamiento" },
  { value: "other", label: "Otros" },
];

export function ExerciseCreator({ onClose, onCreated, onGoToBoard }) {
  const { user, loading } = useUser();

  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [typeValue, setTypeValue] = useState(null);
  const [typeLabel, setTypeLabel] = useState("");
  const [duration, setDuration] = useState("");
  const [players, setPlayers] = useState("");
  const [courtValue, setCourtValue] = useState(null);
  const [courtLabel, setCourtLabel] = useState("");
  const [description, setDescription] = useState("");
  const [linkBoard, setLinkBoard] = useState(false);

  if (loading) {
    return (
      <View style={{ padding: 24, alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleCreateExercise = async () => {
    setError("");

    if (!name.trim() || !typeValue || !duration) {
      setError("Rellena nombre, tipo y duración.");
      return;
    }

    try {
      setSaveLoading(true);

      const durationNum = Number(duration);
      const playersNum = players === "" ? null : Number(players);

      const payload = {
        name: name.trim(),
        type: typeValue,
        duration: isNaN(durationNum) ? null : durationNum,
        players: isNaN(playersNum) ? null : playersNum,
        court: courtValue || null,
        description: description.trim() || null,
        created_by: user?.id || null,
      };

      const {error} = await createExercise(payload);
      if (error) throw error;

      onCreated?.();
    } catch (e) {
      console.error("Error creando ejercicio", e);
      setError(e.message || "No se pudo crear el ejercicio");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={baseStyles.sectionTitle}>Crear nuevo ejercicio</Text>

      {!!error && <Text style={{ color: "red" }}>{error}</Text>}

      <Label>Nombre del ejercicio *</Label>
      <Input
        placeholder="Ej: Serie de tiros libres"
        value={name}
        onChangeText={setName}
      />

      <Label>Tipo *</Label>
      <Dropdown
        placeholder="Seleccionar tipo"
        value={typeLabel}
        options={EXERCISE_TYPES}
        onSelect={(opt) => {
          setTypeValue(opt.value);
          setTypeLabel(opt.label);
        }}
      />

      <Label>Duración (minutos) *</Label>
      <Input
        placeholder="Ej: 15"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
      />

      <Label>Número de jugadores disponibles</Label>
      <Input
        placeholder="Ej: 10"
        value={players}
        onChangeText={setPlayers}
        keyboardType="number-pad"
      />

      <Label>Disponibilidad de pista</Label>
      <Dropdown
        placeholder="Seleccionar disponibilidad"
        value={courtLabel}
        options={COURT_OPTIONS}
        onSelect={(opt) => {
          setCourtValue(opt.value);
          setCourtLabel(opt.label);
        }}
      />

      <Label>Descripción del ejercicio</Label>
      <Input
        placeholder="Describe el ejercicio, objetivos, variantes..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Pressable
        style={localStyles.boardButton}
        onPress={onGoToBoard}
      >
        <Text style={localStyles.boardButtonText}>
          ⛏ Enlazar con Pizarra Táctica
        </Text>
      </Pressable>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        <Pressable
          style={[baseStyles.lightButton, { flex: 1 }]}
          onPress={onClose}
        >
          <Text style={baseStyles.lightText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[baseStyles.darkButton, { flex: 1 }]}
          onPress={handleCreateExercise}
          disabled={saveLoading}
        >
          {saveLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={baseStyles.darkText}>Crear Ejercicio</Text>
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
  boardButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  boardButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
  },
});
