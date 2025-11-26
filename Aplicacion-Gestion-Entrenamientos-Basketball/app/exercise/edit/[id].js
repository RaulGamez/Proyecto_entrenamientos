// app/exercise/edit/[id].js
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { teamStyles as styles } from "../../../components/stylesTeams";

const COURT_OPTIONS = [
  { value: "full", label: "Pista completa" },
  { value: "half", label: "Media pista" },
  { value: "quarter", label: "1/4 pista" },
  { value: "none", label: "Sin pista" },
];

const TYPE_OPTIONS = [
  { value: "warmup", label: "Calentamiento" },
  { value: "fundamentals", label: "Fundamentos" },
  { value: "shooting", label: "Tiro" },
  { value: "defense", label: "Defensa" },
  { value: "tactics", label: "Táctica" },
  { value: "game", label: "Juego / Competición" },
];

export default function EditExercise() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [typeValue, setTypeValue] = useState(null);
  const [typeLabel, setTypeLabel] = useState("");
  const [duration, setDuration] = useState("");
  const [players, setPlayers] = useState("");
  const [courtValue, setCourtValue] = useState(null);
  const [courtLabel, setCourtLabel] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("No se pudo cargar el ejercicio");
      } else if (data) {
        setName(data.name || "");
        const tOpt =
          TYPE_OPTIONS.find((o) => o.value === data.type) || null;
        setTypeValue(tOpt?.value || data.type || null);
        setTypeLabel(tOpt?.label || data.type || "");

        setDuration(data.duration?.toString?.() || "");
        setPlayers(data.players?.toString?.() || "");

        const courtOpt =
          COURT_OPTIONS.find((o) => o.value === data.court) || null;
        setCourtValue(courtOpt?.value || data.court || null);
        setCourtLabel(courtOpt?.label || data.court || "");
        setDescription(data.description || "");
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      if (!name.trim() || !typeValue || !duration) {
        setError("Nombre, tipo y duración son obligatorios.");
        return;
      }

      const payload = {
        name: name.trim(),
        type: typeValue,
        description: description.trim() || null,
      };

      const durNum = Number(duration);
      const playersNum = players === "" ? null : Number(players);
      payload.duration = isNaN(durNum) ? null : durNum;
      payload.players = isNaN(playersNum) ? null : playersNum;

      if (courtValue) {
        payload.court = courtValue;
      } else {
        payload.court = null;
      }

      const { data, error } = await supabase
        .from("exercises")
        .update(payload)
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data)
        throw new Error(
          "No se encontró el ejercicio o no tienes permisos para editarlo."
        );

      Alert.alert(
        "✅ Ejercicio actualizado",
        "Los cambios se guardaron correctamente",
        [{ text: "OK", onPress: () => router.replace("/entrenamientos?tab=exercises") }]
      );
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </View>
    );

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
          headerTitle: "Editar ejercicio",
          headerTintColor: "#000",
        }}
      />

      <Text style={styles.modalTitle}>Editar ejercicio</Text>
      <Text style={styles.modalSubtitle}>
        Actualiza la información del ejercicio
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del ejercicio"
        placeholderTextColor="#9ca3af"
        value={name}
        onChangeText={setName}
      />

      <Dropdown
        label="Tipo"
        placeholder="Seleccionar tipo"
        value={typeLabel}
        options={TYPE_OPTIONS}
        onSelect={(opt) => {
          setTypeValue(opt.value);
          setTypeLabel(opt.label);
        }}
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

      <TextInput
        style={[
          styles.input,
          { height: 100, textAlignVertical: "top", marginTop: 8 },
        ]}
        placeholder="Descripción del ejercicio"
        placeholderTextColor="#9ca3af"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* NUEVO BOTÓN PIZARRA */}
        <Pressable
        style={[
            styles.lightButton,
            {
            marginTop: 12,
            borderColor: "#4f46e5",
            borderWidth: 1,
            backgroundColor: "#eef2ff",
            },
        ]}
        onPress={() => router.push("/pizarra")}
        >
        <Text style={[styles.lightText, { color: "#1d1b7f" }]}>
            Ir a Pizarra Táctica
        </Text>
        </Pressable>

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
          style={[styles.darkButton, { flex: 1, opacity: saving ? 0.6 : 1 }]}
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
