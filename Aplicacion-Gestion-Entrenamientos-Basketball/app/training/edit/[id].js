// app/training/edit/[id].js
import { useEffect, useState } from "react";
import {View,Text,TextInput,ScrollView,Pressable,ActivityIndicator,Alert,Platform,StyleSheet,} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { teamStyles as styles } from "../../../components/stylesTeams";

const COURT_OPTIONS = [
  { value: "full", label: "Pista completa" },
  { value: "half", label: "Media pista" },
  { value: "quarter", label: "1/4 pista" },
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
        setDuration(data.duration?.toString?.() || "");
        setPlayers(data.players?.toString?.() || "");
        const court = data.court || null;
        const courtOpt =
          COURT_OPTIONS.find((o) => o.value === court || o.label === court) ||
          null;

        setCourtValue(courtOpt?.value || null);
        setCourtLabel(courtOpt?.label || "");
        setDescription(data.description || "");
      }

      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      if (!date || !duration) {
        setError("Fecha y duración son obligatorias.");
        return;
      }

       const payload = {
        date: date.trim(),
        description: description.trim() || null, // columna con typo
      };

      const durNum = Number(duration);
      const playersNum = players === "" ? null : Number(players);

      payload.duration = isNaN(durNum) ? null : durNum;
      payload.players = isNaN(playersNum) ? null : playersNum;

      if (courtValue) {
        payload.court = courtValue;
      }

      const { data, error } = await supabase
        .from("trainings")
        .update(payload)
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data)
        throw new Error(
          "No se encontró el entrenamiento o no tienes permisos para editarlo."
        );

      Alert.alert(
        "Entrenamiento actualizado",
        "Los cambios se guardaron correctamente",
        [{ text: "OK", onPress: () => router.replace("/entrenamientos") }]
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
