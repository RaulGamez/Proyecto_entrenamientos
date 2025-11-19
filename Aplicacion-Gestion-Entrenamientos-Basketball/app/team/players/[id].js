// app/players/[id].js
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, Platform, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { teamStyles as styles } from "../../../components/stylesTeams";

export default function EditPlayer() {
  const { id } = useLocalSearchParams(); // playerId
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);
  const [formatErrors, setFormatErrors] = useState({
    name: "",
    number: "",
    age: "",
    role: "",
    height: "",
    status: ""
  });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("players").select("*").eq("id", id).single();
      if (error) {
        Alert.alert("Error", error.message);
        router.back();
        return;
      }
      setPlayer({
        ...data,
        name: data.name ?? "",
        number: data.number ?? "",
        age: data.age ?? "",
        role: data.role ?? "",
        height: data.height ?? "",
        status: data.status ?? "active",
      });
      setLoading(false);
    })();
  }, [id]);

  const save = async () => {
    setFormatErrors(validatePlayerinfo(player));
    const hasErrors = Object.values(formatErrors).some(msg => msg !== "");
    if (hasErrors) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("players")
        .update({
          name: player.name,
          number: player.number ? Number(player.number) : null,
          age: player.age ? Number(player.age) : null,
          role: player.role || null,
          height: player.height || null,
          status: player.status || "active",
        })
        .eq("id", id);

      if (error) {
        throw error;
        return;
      }
      router.back();
    } catch (e) {
      Alert.alert("Error", e.message || String(e));
    }
  };

  const remove = async () => {
    Alert.alert("Borrar jugador", "¿Seguro que quieres borrar este jugador?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("players").delete().eq("id", id);
          if (error) return Alert.alert("Error", error.message);
          router.back();
        },
      },
    ]);
  };

  if (loading || !player) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Editar jugador</Text>

      <Label>Nombre</Label>
      <Input value={player.name} onChangeText={(t) => setPlayer((p) => ({ ...p, name: t }))} placeholder="Nombre" />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Label>Número</Label>
          <Input
            keyboardType="numeric"
            value={String(player.number ?? "")}
            onChangeText={(t) => setPlayer((p) => ({ ...p, number: t }))}
            placeholder="0"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Label>Año de nacimiento</Label>
          <Input
            keyboardType="numeric"
            value={String(player.age ?? "")}
            onChangeText={(t) => setPlayer((p) => ({ ...p, age: t }))}
            placeholder="2009"
          />
        </View>
      </View>

      <Label>Posición</Label>
      <Input value={player.role} onChangeText={(t) => setPlayer((p) => ({ ...p, role: t }))} placeholder="Base / Escolta…" />

      <Label>Altura (cm)</Label>
      <Input value={player.height} onChangeText={(t) => setPlayer((p) => ({ ...p, height: t }))} placeholder="185" />

      <Label>Estado</Label>
      <Input value={player.status} onChangeText={(t) => setPlayer((p) => ({ ...p, status: t }))} placeholder="active | inactive | injured" />

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        <Pressable style={[styles.lightButton, { flex: 1 }]} onPress={() => router.back()}>
          <Text style={styles.lightText}>Cancelar</Text>
        </Pressable>
        <Pressable style={[styles.darkButton, { flex: 1 }]} onPress={save}>
          <Text style={styles.darkText}>Guardar</Text>
        </Pressable>
      </View>

      <Pressable style={[styles.darkButton, { marginTop: 12, backgroundColor: "#b91c1c" }]} onPress={remove}>
        <Text style={styles.darkText}>Borrar jugador</Text>
      </Pressable>
    </ScrollView>
  );
}

/* Helpers locales */
const Label = ({ children }) => <Text style={{ color: "#6b7280", marginTop: 10, marginBottom: 6 }}>{children}</Text>;
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
      marginBottom: 8,
    }}
  />
);
