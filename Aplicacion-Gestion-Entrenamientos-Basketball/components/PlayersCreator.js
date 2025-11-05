// components/PlayersCreator.js
import { useState } from "react";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { teamStyles as styles } from "./stylesTeams";

export function PlayersCreator({ teams = [], onCreated, onClose }) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("");
  const [height, setHeight] = useState("");
  const [teamId, setTeamId] = useState(null); // null => sin equipo
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name,
        number: number ? Number(number) : null,
        age: age ? Number(age) : null,
        role: role || null,
        height: height || null,
        team_id: teamId || null, // 👈 opcional
        status: "active",
      };
      const { error } = await supabase.from("players").insert(payload);
      if (error) throw error;
      onCreated?.();
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={styles.sectionTitle}>Crear nuevo jugador</Text>

      <Label>Nombre</Label>
      <Input placeholder="Ej. Carlos Martínez" value={name} onChangeText={setName} />

      <Row>
        <Col>
          <Label>Número</Label>
          <Input placeholder="23" keyboardType="numeric" value={number} onChangeText={setNumber} />
        </Col>
        <Col>
          <Label>Edad</Label>
          <Input placeholder="16" keyboardType="numeric" value={age} onChangeText={setAge} />
        </Col>
      </Row>

      <Label>Posición</Label>
      <Input placeholder="Base / Escolta…" value={role} onChangeText={setRole} />

      <Label>Altura</Label>
      <Input placeholder="1.85m" value={height} onChangeText={setHeight} />

      <Label>Equipo (opcional)</Label>
      <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <Pressable
          onPress={() => setTeamId(null)}
          style={{ padding: 12, backgroundColor: teamId ? "#fff" : "#eef2ff" }}
        >
          <Text>{teamId ? "Sin equipo" : "✓ Sin equipo"}</Text>
        </Pressable>
        {teams.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTeamId(t.id)}
            style={{ padding: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: teamId === t.id ? "#dcfce7" : "#fff" }}
          >
            <Text>{t.name}</Text>
          </Pressable>
        ))}
      </View>

      <Row style={{ marginTop: 12 }}>
        <Pressable style={[styles.lightButton, { flex: 1 }]} onPress={onClose}>
          <Text style={styles.lightText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.darkButton, { flex: 1, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving || !name.trim()}
        >
          <Text style={styles.darkText}>Crear jugador</Text>
        </Pressable>
      </Row>
    </View>
  );
}

/* helpers UI */
const Label = ({ children }) => <Text style={{ color: "#6b7280", marginTop: 6, marginBottom: 4 }}>{children}</Text>;
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
    }}
  />
);
const Row = ({ children, style }) => <View style={[{ flexDirection: "row", gap: 10 }, style]}>{children}</View>;
const Col = ({ children }) => <View style={{ flex: 1 }}>{children}</View>;
