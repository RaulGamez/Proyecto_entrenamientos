// app/players/[id].js
import { useEffect, useState, useMemo} from "react";
import { View, Text, TextInput, Pressable, Alert, Platform, ScrollView, ActivityIndicator} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { teamStyles as styles } from "../../../components/stylesTeams";
import { validatePlayerInfo } from "../../../lib/validators";
import { deletePlayers } from "../../../lib/queries";
import { CloseIcon } from "../../../components/icons";

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
    status: "",
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", id)
        .single();

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
    const errors = validatePlayerInfo(player);
    setFormatErrors(errors);

    const hasErrors = Object.values(errors).some((msg) => msg !== "");
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

      if (error) throw error;

      router.back();
    } catch (e) {
      Alert.alert("Error", e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    Alert.alert("Borrar jugador", "¿Seguro que quieres borrar este jugador?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          const { error } = await deletePlayers([id]);
          if (error) return Alert.alert("Error", error.message);
          router.back();
        },
      },
    ]);
  };

  const playerSubtitle = useMemo(() => {
    const num = player?.number ? `#${player.number}` : null;
    const role = player?.role ? player.role : null;
    return [num, role].filter(Boolean).join(" · ") || "Jugador";
  }, [player]);

  const numberLabel = player?.number ? String(player.number) : "-";
  const birthYearLabel = player?.age ? String(player.age) : "-";
  const statusLabel = player?.status ? String(player.status) : "-";

  if (loading && !player) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No se encontró el jugador</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      {/* CABECERA OSCURA (igual que ExerciseDetail) */}
      <View
        style={{
          paddingTop: 40,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: "#0f172a",
        }}
      >
        <Text
          style={[
            styles.teamTitle,
            { fontSize: 20, color: "#fff", marginRight: 40 },
          ]}
          numberOfLines={1}
        >
          {player.name || "Editar jugador"}
        </Text>

        <Text style={[styles.teamSubtitle, { color: "#cbd5f5" }]}>
          {playerSubtitle}
        </Text>

        {/* Botón cerrar */}
        <Pressable
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: 40,
            right: 16,
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: 20,
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CloseIcon color="#fff" size={20} />
        </Pressable>
      </View>

      {/* CONTENIDO */}
      <View style={{ padding: 16 }}>
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>
          Información del jugador
        </Text>

        <Text style={{ color: "#6b7280", marginTop: 4 }}>
          Edita los datos y guarda los cambios.
        </Text>

        {/* Card tipo “Duración/Jugadores/Pista” */}
        <View
          style={{
            marginTop: 16,
            borderRadius: 12,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e5e7eb",
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <InfoItem label="Número" value={numberLabel} />
            <Divider />
            <InfoItem label="Nacimiento" value={birthYearLabel} />
            <Divider />
            <InfoItem label="Estado" value={statusLabel} />
          </View>
        </View>

        {/* Sección “Descripción” -> aquí lo usamos como “Datos” */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Datos del jugador
        </Text>

        <View
          style={{
            marginTop: 8,
            borderRadius: 10,
            backgroundColor: "#f3f5ffff",
            padding: 12,
          }}
        >
          {/* Bloque con inputs con look “limpio” */}
          <Label>Nombre</Label>
          <Input
            value={player.name}
            onChangeText={(t) => setPlayer((p) => ({ ...p, name: t }))}
            placeholder="Nombre"
          />
          {!!formatErrors.name && <ErrorText>{formatErrors.name}</ErrorText>}

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Label>Número</Label>
              <Input
                keyboardType="numeric"
                value={String(player.number ?? "")}
                onChangeText={(t) => setPlayer((p) => ({ ...p, number: t }))}
                placeholder="0"
              />
              {!!formatErrors.number && (
                <ErrorText>{formatErrors.number}</ErrorText>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Label>Año de nacimiento</Label>
              <Input
                keyboardType="numeric"
                value={String(player.age ?? "")}
                onChangeText={(t) => setPlayer((p) => ({ ...p, age: t }))}
                placeholder="2009"
              />
              {!!formatErrors.age && <ErrorText>{formatErrors.age}</ErrorText>}
            </View>
          </View>

          <Label>Posición</Label>
          <Input
            value={player.role}
            onChangeText={(t) => setPlayer((p) => ({ ...p, role: t }))}
            placeholder="Base / Escolta…"
          />
          {!!formatErrors.role && <ErrorText>{formatErrors.role}</ErrorText>}

          <Label>Altura (cm)</Label>
          <Input
            keyboardType="numeric"
            value={String(player.height ?? "")}
            onChangeText={(t) => setPlayer((p) => ({ ...p, height: t }))}
            placeholder="185"
          />
          {!!formatErrors.height && (
            <ErrorText>{formatErrors.height}</ErrorText>
          )}

          <Label>Estado</Label>
          <Input
            value={player.status}
            onChangeText={(t) => setPlayer((p) => ({ ...p, status: t }))}
            placeholder="active | inactive | injured"
          />
          {!!formatErrors.status && (
            <ErrorText>{formatErrors.status}</ErrorText>
          )}
        </View>

        {/* BOTÓN PRINCIPAL (look tipo “Ir a Pizarra”) */}
        <Pressable
          style={[
            styles.lightButton,
            {
              marginTop: 24,
              marginBottom: 4,
              borderColor: "#4f46e5",
              borderWidth: 1,
              backgroundColor: "#eef2ff",
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={save}
          disabled={loading}
        >
          <Text style={[styles.lightText, { color: "#1d1b7f" }]}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Text>
        </Pressable>

        {/* ACCIONES: Cancelar / Borrar (igual estructura que ejercicio) */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 18,
            marginBottom: 24,
          }}
        >
          <Pressable
            style={[styles.lightButton, { flex: 1 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.lightText}>Cancelar</Text>
          </Pressable>

          <Pressable
            style={[styles.darkButton, { flex: 1, backgroundColor: "#11104cff" }]}
            onPress={remove}
          >
            <Text style={styles.darkText}>Borrar jugador</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

/* Helpers locales (mismo estilo que exercise) */
function InfoItem({ label, value }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color: "#6b7280", fontSize: 12 }}>{label}</Text>
      <Text
        style={{
          marginTop: 2,
          fontSize: 15,
          fontWeight: "600",
          color: "#111827",
          textAlign: "center",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const Divider = () => (
  <View
    style={{
      width: 1,
      backgroundColor: "#e5e7eb",
      marginHorizontal: 8,
    }}
  />
);

const Label = ({ children }) => (
  <Text style={{ color: "#6b7280", marginTop: 10, marginBottom: 6 }}>
    {children}
  </Text>
);

const ErrorText = ({ children }) => (
  <Text style={{ color: "#b91c1c", marginTop: -4, marginBottom: 6 }}>
    {children}
  </Text>
);

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
      backgroundColor: "#fff",
      marginBottom: 8,
      color: "#111827",
    }}
  />
);
