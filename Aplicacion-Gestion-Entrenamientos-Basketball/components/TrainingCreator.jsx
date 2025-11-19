import { useState } from "react";
import { View, Text, TextInput, Pressable, Platform, ActivityIndicator, ScrollView } from "react-native";
import { supabase } from "../lib/supabase";
import { useUser } from "../contexts/UserContexts";
import { styles } from "./styles";

export function TrainingCreator({onClose, onCreated}) {
    const { user, loading } = useUser();
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState("");

    const [date, setDate] = useState("");
    const [team, setTeam] = useState("");
    const [duration, setDuration] = useState("");
    const [players, setPlayers] = useState("");
    const [court, setCourt] = useState("");
    const [description, setDescription] = useState("");
    const [exercices, setExercices] = useState("");

    const handleCreateTraining = async () => {
        // falta por implementar
        return;
    };
    
    if (loading) {
      return (
      <View style={{ padding: 24, alignItems: "center" }}>
          <ActivityIndicator size="large" />
      </View>
      );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          <Text style={styles.sectionTitle}>Crear nuevo entrenamiento</Text>
          
            <Label>Fecha *</Label>
            <Input placeholder="Ej. Carlos Martínez" value={date} onChangeText={setDate} />
        
            <Label>Equipo *</Label>
            <Input placeholder="Seleccionar equipo" value={team} onChangeText={setTeam} />
        
            <Label>Duracion (minutos) *</Label>
            <Input placeholder="Ej: 90" value={duration} onChangeText={setDuration} />
        
            <Label>Jugadores disponibles</Label>
            <Input placeholder="Número de jugadores" value={players} onChangeText={setPlayers} />

            <Label>Pista disponible</Label>
            <Input placeholder="Seleccionar disponiblidad" value={court} onChangeText={setCourt} />

            <Label>Ejercicios de entrenamiento</Label>
            <Input placeholder="Place holder" value={exercices} onChangeText={setExercices} />

            <Label>Descripción</Label>
            <Input placeholder="Notas adicionales sobre el entrenamiento" value={description} onChangeText={setDescription} />
        
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <Pressable style={[styles.lightButton, { flex: 1 }]} onPress={onClose}>
                    <Text style={styles.lightText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.darkButton, { flex: 1 }]} onPress={handleCreateTraining}>
                    <Text style={styles.darkText}>Crear</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

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