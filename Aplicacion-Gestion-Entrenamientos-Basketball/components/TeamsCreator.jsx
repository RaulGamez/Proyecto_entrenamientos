// components/TeamsCreator.jsx
// Componente para crear un nuevo equipo
import { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView, StyleSheet} from "react-native";
import Slider from "@react-native-community/slider";
import { supabase } from "../lib/supabase";
import { useUser } from "../contexts/UserContexts";
import { teamStyles as styles } from "./stylesTeams";
import { TrainingSchedulePicker } from "./TrainingSchedulePicker";
import { createTeam } from "../lib/queries";


export function TeamsCreator({ onClose, onCreated }) {
  const { user, loading } = useUser();
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Campos del formulario
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [playersTarget, setPlayersTarget] = useState("12");
  const [trainingDays, setTrainingDays] = useState("");
  const [schedule, setSchedule] = useState(null);

  // Sliders (0-100)
  const [bote, setBote] = useState(50);
  const [tiro, setTiro] = useState(50);
  const [pase, setPase] = useState(50);
  const [defensa, setDefensa] = useState(50);
  const [competicion, setCompeticion] = useState(50);
  const [dinamico, setDinamico] = useState(50);

  const round5 = (v) => Math.max(0, Math.min(100, Math.round(v / 5) * 5));


  const valid = name.trim().length >= 3;

  if (loading) {
      return (
      <View style={{ padding: 24, alignItems: "center" }}>
          <ActivityIndicator size="large" />
      </View>
      );
  }

  const handleSaveTeam = async () => {
    try {
      setError("");
      setSaveLoading(true);

      // función que redondea a múltiplos de 5
      const round5 = (v) => Math.max(0, Math.min(100, Math.round(v / 5) * 5));

      // preparamos los datos antes de insertar
      const payload = {
        name: name.trim() || "Equipo sin título",
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
        created_by: user?.id,
      };

      // insertamos en Supabase
      const { error: insertError } = await createTeam(payload);

      onCreated && (await onCreated());
      onClose && (await onClose());
    } catch (e) {
      setError(e?.message ?? "Error guardando equipo");
    } finally {
      setSaveLoading(false);
    }
  };

  const SliderRow = ({ label, value, onChange }) => (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.rangeText}>{Math.round(value)}</Text>
      </View>
      <Slider minimumValue={0} maximumValue={100} step={5} value={value} onValueChange={(v) => onChange(v)} onSlidingComplete={(v) => onChange(round5(v))}/>
    </View>
  );


  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={styles.modalTitle}>Crear Nuevo Equipo</Text>
      <Text style={styles.modalSubtitle}>Define los detalles y objetivos de tu nuevo equipo</Text>

      <TextInput
        placeholder="Nombre del Equipo (ej. Cadete Femenino A)"
        placeholderTextColor="#9ca3af"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Categoría (ej. 1 zonal, Preferente...)"
        placeholderTextColor="#9ca3af"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        placeholder="Número de Jugadores (ej. 12)"
        placeholderTextColor="#9ca3af"
        style={styles.input}
        keyboardType="number-pad"
        value={playersTarget}
        onChangeText={setPlayersTarget}
      />

      <TrainingSchedulePicker value={schedule} onChange={setSchedule} />


      <Text style={styles.sectionHeaderText}>Objetivos de Entrenamiento (0-100)</Text>

      <SliderRow label="Bote" value={bote} onChange={setBote} />
      <SliderRow label="Tiro" value={tiro} onChange={setTiro} />
      <SliderRow label="Pase" value={pase} onChange={setPase} />
      <SliderRow label="Defensa" value={defensa} onChange={setDefensa} />
      <SliderRow label="Competición" value={competicion} onChange={setCompeticion} />
      <SliderRow label="Dinámico" value={dinamico} onChange={setDinamico} />

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
        <Pressable style={[styles.lightButton, { flex: 1 }]} onPress={onClose} disabled={saveLoading}>
          <Text style={styles.lightText}>Cancelar</Text>
        </Pressable>
        <Pressable
          onPress={handleSaveTeam}
          disabled={saveLoading || !valid}
          style={[styles.darkButton, { flex: 1, opacity: saveLoading || !valid ? 0.6 : 1 }]}
        >
          <Text style={styles.darkText}>{saveLoading ? "Creando..." : "Crear Equipo"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}