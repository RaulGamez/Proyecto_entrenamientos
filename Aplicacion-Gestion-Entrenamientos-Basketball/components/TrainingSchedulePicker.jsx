// components/TrainingSchedulePicker.jsx
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { teamStyles as styles } from "./stylesTeams";

// --- util horas ---
function toHHMM(mins) {
  const h = Math.floor((mins || 0) / 60);
  const m = (mins || 0) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function round5(hhmm) {
  if (!hhmm) return "00:00";
  const [h, m] = String(hhmm).split(":").map(Number);
  const r = Math.round(((h || 0) * 60 + (m || 0)) / 5) * 5;
  return toHHMM(r);
}

// --- estructura inicial de horario ---
const EMPTY_SCHEDULE = {
  mon: { enabled: false, start: "18:00", end: "19:00" },
  tue: { enabled: false, start: "18:00", end: "19:00" },
  wed: { enabled: false, start: "18:00", end: "19:00" },
  thu: { enabled: false, start: "18:00", end: "19:00" },
  fri: { enabled: false, start: "18:00", end: "19:00" },
};
const DAYS = [
  ["mon", "Lun"],
  ["tue", "Mar"],
  ["wed", "Mié"],
  ["thu", "Jue"],
  ["fri", "Vie"],
];

// --- picker embebido ---
export function TrainingSchedulePicker({ value, onChange }) {
  const [schedule, setSchedule] = useState(value || EMPTY_SCHEDULE);

  function handleChange(k, field, val) {
    const next = {
      ...schedule,
      [k]: { ...schedule[k], [field]: field === "enabled" ? val : round5(val) },
    };
    setSchedule(next);
    onChange?.(next);
  }

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.sectionHeaderText}>Días de entrenamiento</Text>
      {DAYS.map(([k, label]) => {
        const d = schedule[k];
        return (
          <View
            key={k}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}
          >
            <Pressable
              onPress={() => handleChange(k, "enabled", !d.enabled)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: d.enabled ? "#0f172a" : "#e5e7eb",
                backgroundColor: d.enabled ? "#0f172a" : "#fff",
              }}
            >
              <Text style={{ color: d.enabled ? "#fff" : "#111" }}>{label}</Text>
            </Pressable>

            <TextInput
              editable={d.enabled}
              value={d.start}
              onChangeText={(t) => handleChange(k, "start", t)}
              placeholder="Inicio (hh:mm)"
              keyboardType="numbers-and-punctuation"
              style={[styles.input, { flex: 1, opacity: d.enabled ? 1 : 0.5 }]}
            />
            <TextInput
              editable={d.enabled}
              value={d.end}
              onChangeText={(t) => handleChange(k, "end", t)}
              placeholder="Fin (hh:mm)"
              keyboardType="numbers-and-punctuation"
              style={[styles.input, { flex: 1, opacity: d.enabled ? 1 : 0.5 }]}
            />
          </View>
        );
      })}
    </View>
  );
}