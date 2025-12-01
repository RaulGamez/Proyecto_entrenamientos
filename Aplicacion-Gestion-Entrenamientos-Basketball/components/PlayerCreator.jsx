// components/PlayerCreator.js
import { useState } from "react";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { validatePlayerInfo } from "../lib/validators";
import { createPlayer } from "../lib/queries";
import { styles } from "./styles";

export function PlayerCreator({ teams = [], onCreated, onClose }) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("");
  const [height, setHeight] = useState("");
  const [teamsId, setTeamsId] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formatErrors, setFormatErrors] = useState({
    name: "",
    number: "",
    age: "",
    role: "",
    height: "",
    status: ""
  });

  const handleSavePlayer = async () => {
    const playerInfo = {
      name: name || "Jugador sin nombre",
      number: number ? Number(number) : null,
      age: age ? Number(age) : null,
      role: role || null,
      height: height || null,
      status: "active",
    };
    const validation = validatePlayerInfo(playerInfo);
    console.log(validation);
    setFormatErrors(validation);
    const hasErrors = Object.values(formatErrors).some(msg => msg !== "");
    if (hasErrors) return;

    setIsLoading(true);
    try {
      // insert in players table
      const { error } = await createPlayer({player: playerInfo, teams: teamsId});
      if (error) {
        throw error;
        return;
      }

      onCreated?.();
    } catch (e) {
      alert("aqui es el error: " + e.message || String(e));
    } finally {
      setIsLoading(false);
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
          <Label>Año de nacimiento</Label>
          <Input placeholder="2009" keyboardType="numeric" value={age} onChangeText={setAge} />
        </Col>
      </Row>

      <Label>Posición</Label>
      <Input placeholder="Base / Escolta…" value={role} onChangeText={setRole} />

      <Label>Altura (cm)</Label>
      <Input placeholder="185" value={height} onChangeText={setHeight} />

      <Label>Equipo (opcional)</Label>
      <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <Pressable
          onPress={() => setTeamsId([])}
          style={{ padding: 12, backgroundColor: teamsId.length > 0 ? "#fff" : "#eef2ff" }}
        >
          <Text>{teamsId.length > 0 ? "Sin equipo" : "✓ Sin equipo"}</Text>
        </Pressable>
        {teams.map((t) => (
          <Pressable
            key={t.id}
            onPress={() =>
              setTeamsId(prev =>
                prev.includes(t.id)
                  ? prev.filter(id => id !== t.id) // quitar
                  : [...prev, t.id]               // añadir
              )
            }
            style={{ padding: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: teamsId.includes(t.id) ? "#dcfce7" : "#fff" }}
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
          style={[styles.darkButton, { flex: 1, opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleSavePlayer}
          disabled={isLoading || !name.trim()}
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
