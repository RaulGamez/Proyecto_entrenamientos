// app/team/matches/[id].js
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, Platform, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { teamStyles as styles } from "../../../components/stylesTeams";

export default function EditMatch() {
  const { id } = useLocalSearchParams(); // matchId
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("matches").select("*").eq("id", id).single();
      if (error) {
        Alert.alert("Error", error.message);
        router.back();
        return;
      }
      setMatch({
        ...data,
        // normaliza a strings para inputs
        opponent: data.opponent ?? "",
        date: formatDateInput(data.date),
        our_pts: data.our_pts ?? 0,
        opp_pts: data.opp_pts ?? 0,
      });
      setLoading(false);
    })();
  }, [id]);

  const save = async () => {
    try {
      const our = Number(match.our_pts || 0);
      const opp = Number(match.opp_pts || 0);
      const result = our > opp ? "win" : our < opp ? "loss" : "draw";

      const { error } = await supabase
        .from("matches")
        .update({
          opponent: match.opponent,
          date: parseAnyDateToISO(match.date), // acepta dd/mm/yyyy o yyyy-mm-dd
          our_pts: our,
          opp_pts: opp,
          result,
        })
        .eq("id", id);

      if (error) throw error;
      router.back();
    } catch (e) {
      Alert.alert("Error", e.message || String(e));
    }
  };

  const remove = async () => {
    Alert.alert("Borrar partido", "¿Seguro que quieres borrar este partido?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("matches").delete().eq("id", id);
          if (error) return Alert.alert("Error", error.message);
          router.back();
        },
      },
    ]);
  };

  if (loading || !match) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Editar partido</Text>

      <Label>Rival</Label>
      <Input value={match.opponent} onChangeText={(t) => setMatch((m) => ({ ...m, opponent: t }))} placeholder="Rival" />

      <Label>Fecha</Label>
      <Input value={match.date} onChangeText={(t) => setMatch((m) => ({ ...m, date: t }))} placeholder="dd/mm/yyyy o yyyy-mm-dd" />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Label>Puntos {/** propios */}</Label>
          <Input
            keyboardType="numeric"
            value={String(match.our_pts ?? "")}
            onChangeText={(t) => setMatch((m) => ({ ...m, our_pts: t }))}
            placeholder="0"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Label>Puntos rival</Label>
          <Input
            keyboardType="numeric"
            value={String(match.opp_pts ?? "")}
            onChangeText={(t) => setMatch((m) => ({ ...m, opp_pts: t }))}
            placeholder="0"
          />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        <Pressable style={[styles.lightButton, { flex: 1 }]} onPress={() => router.back()}>
          <Text style={styles.lightText}>Cancelar</Text>
        </Pressable>
        <Pressable style={[styles.darkButton, { flex: 1 }]} onPress={save}>
          <Text style={styles.darkText}>Guardar</Text>
        </Pressable>
      </View>

      <Pressable style={[styles.darkButton, { marginTop: 12, backgroundColor: "#b91c1c" }]} onPress={remove}>
        <Text style={styles.darkText}>Borrar partido</Text>
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

// dd/mm/yyyy para inputs
function formatDateInput(d) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return String(d ?? "");
  }
}
function parseAnyDateToISO(s) {
  if (!s) return new Date().toISOString();
  const slash = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const dash = /^(\d{4})-(\d{2})-(\d{2})$/;
  let y, m, d;
  if (slash.test(s)) {
    const [, dd, mm, yyyy] = s.match(slash);
    y = Number(yyyy); m = Number(mm) - 1; d = Number(dd);
  } else if (dash.test(s)) {
    const [, yyyy, mm, dd] = s.match(dash);
    y = Number(yyyy); m = Number(mm) - 1; d = Number(dd);
  } else {
    const dt = new Date(s);
    if (!isNaN(+dt)) return dt.toISOString();
    return new Date().toISOString();
  }
  return new Date(y, m, d).toISOString();
}
