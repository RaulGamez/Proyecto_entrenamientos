// app/team/edit/[id].js
import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { teamStyles as styles } from "../../../components/stylesTeams";
import { TrainingSchedulePicker } from "../../../components/TrainingSchedulePicker";

export default function EditTeam() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // campos editables
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [playersTarget, setPlayersTarget] = useState("");
  const [schedule, setSchedule] = useState(null);

  // objetivos
  const [bote, setBote] = useState(50);
  const [tiro, setTiro] = useState(50);
  const [pase, setPase] = useState(50);
  const [defensa, setDefensa] = useState(50);
  const [competicion, setCompeticion] = useState(50);
  const [dinamico, setDinamico] = useState(50);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("teams").select("*").eq("id", id).single();
      if (error) {
        setError("No se pudo cargar el equipo");
      } else if (data) {
        setName(data.name || "");
        setCategory(data.category || "");
        setPlayersTarget(data.players_target?.toString() || "");
        setSchedule(data.training_days || null);

        const g = data.goals || {};
        setBote(g.bote ?? 50);
        setTiro(g.tiro ?? 50);
        setPase(g.pase ?? 50);
        setDefensa(g.defensa ?? 50);
        setCompeticion(g.competicion ?? 50);
        setDinamico(g.dinamico ?? 50);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const round5 = (v) => Math.max(0, Math.min(100, Math.round(v / 5) * 5));

      const payload = {
        name: name.trim(),
        category: category.trim() || null,
        players_target: playersTarget === "" ? null : Number(playersTarget),
        training_days: schedule,
        goals: {
          bote: round5(bote),
          tiro: round5(tiro),
          pase: round5(pase),
          defensa: round5(defensa),
          competicion: round5(competicion),
          dinamico: round5(dinamico),
        },
      };

      const { data, error } = await supabase
        .from("teams")
        .update(payload)
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("No se encontró el equipo o no tienes permisos para editarlo.");

      Alert.alert("✅ Equipo actualizado", "Los cambios se guardaron correctamente", [
        { text: "OK", onPress: () => router.replace("/equipo") },
      ]);
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

  const SliderRow = ({ label, value, onChange }) => (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.rangeText}>{Math.round(value)}%</Text>
      </View>
      <Slider
        minimumValue={0}
        maximumValue={100}
        step={5}
        value={value}
        onValueChange={(v) => onChange(v)}
        onSlidingComplete={(v) => onChange(Math.round(v / 5) * 5)}
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10, backgroundColor: "#f6f7fb" }}>
      <Stack.Screen
        options={{
          headerTitle: "Editar equipo",
          headerTintColor: "#000",
        }}
      />

      <Text style={styles.modalTitle}>Editar equipo</Text>
      <Text style={styles.modalSubtitle}>Actualiza la información y los objetivos</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del equipo"
        placeholderTextColor="#9ca3af"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Categoría"
        placeholderTextColor="#9ca3af"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de jugadores"
        placeholderTextColor="#9ca3af"
        keyboardType="number-pad"
        value={playersTarget}
        onChangeText={setPlayersTarget}
      />

      {/* Selector de días y horas de entrenamiento */}
      <TrainingSchedulePicker value={schedule} onChange={setSchedule} />

      <Text style={[styles.sectionHeaderText, { marginTop: 8 }]}>Objetivos de entrenamiento</Text>
      <SliderRow label="Bote" value={bote} onChange={setBote} />
      <SliderRow label="Tiro" value={tiro} onChange={setTiro} />
      <SliderRow label="Pase" value={pase} onChange={setPase} />
      <SliderRow label="Defensa" value={defensa} onChange={setDefensa} />
      <SliderRow label="Competición" value={competicion} onChange={setCompeticion} />
      <SliderRow label="Dinámico" value={dinamico} onChange={setDinamico} />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
        <Pressable style={[styles.lightButton, { flex: 1 }]} onPress={() => router.back()} disabled={saving}>
          <Text style={styles.lightText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.darkButton, { flex: 1, opacity: saving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.darkText}>{saving ? "Guardando..." : "Guardar cambios"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
