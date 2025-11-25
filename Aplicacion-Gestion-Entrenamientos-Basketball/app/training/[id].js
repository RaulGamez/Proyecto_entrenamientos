// app/training/[id].js
import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, ImageBackground, Pressable, Alert, ActivityIndicator} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { teamStyles as styles } from "../../components/stylesTeams";
import { CloseIcon } from "../../components/icons";

export default function TrainingDetail() {
  const router = useRouter();
  const { id: trainingId } = useLocalSearchParams(); 

  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar entrenamiento desde la tabla trainings
  useEffect(() => {
    if (!trainingId) return;

    (async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("id", trainingId)
        .single();

      if (error) {
        console.log("Error loading training", error);
      }
      setTraining(data || null);
      setLoading(false);
    })();
  }, [trainingId]);

  const handleDelete = async () => {
    Alert.alert(
      "Eliminar entrenamiento",
      "¿Seguro que quieres borrar este entrenamiento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.from("trainings").delete().eq("id", trainingId);
            } catch (e) {
              Alert.alert(
                "Error",
                e.message || "No se pudo borrar el entrenamiento"
              );
              return;
            }
            router.replace("/entrenamientos");
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/training/edit/${trainingId}`);
  };

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!training) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>No se encontró el entrenamiento</Text>
      </View>
    );
  }

  // Mapeo flexible de columnas según tu tabla
  const date = training.date || training.training_date || "";
  const durationRaw =
    training.duration_minutes ??
    training.duration ??
    training.duration_minutos ??
    null;
  const playersRaw =
    training.players_count ?? training.players ?? training.num_players ?? null;

  const durationLabel = durationRaw != null ? `${durationRaw} min` : "-";
  const playersLabel =
    playersRaw != null && playersRaw !== "" ? String(playersRaw) : "-";

  const courtValue =
    training.court || training.court_type || training.court_value || null;
  const courtLabel =
    training.court_label ||
    ({
      full: "Pista completa",
      half: "Media pista",
      quarter: "1/4 pista",
      none: "Sin pista",
    }[courtValue] ?? "Sin pista");

  const teamName =
    training.team_name || training.team || training.team_label || "Sin equipo";

  const description = training.description || "";

  const coverSource = training.cover_url
    ? { uri: training.cover_url }
    : require("../../img/train.jpg");

  return (
    <ScrollView style={styles.screen}>
      {/* Cabecera con imagen */}
      <View style={{ position: "relative" }}>
        <ImageBackground
          source={coverSource}
          style={{ height: 220, justifyContent: "flex-end" }}
        >
          <View style={styles.teamCoverOverlay} />
          <View style={{ padding: 16 }}>
            <Text style={[styles.teamTitle, { fontSize: 20 }]}>
              {teamName || "Entrenamiento"}
            </Text>
            {date ? (
              <Text style={styles.teamSubtitle}>{date}</Text>
            ) : null}
          </View>
        </ImageBackground>

        {/* Botón cerrar */}
        <Pressable
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: 28,
            right: 20,
            backgroundColor: "rgba(0,0,0,0.5)",
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

      {/* Contenido */}
      <View style={{ padding: 16 }}>
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>
          Información del entrenamiento
        </Text>

        <View
          style={{
            marginTop: 12,
            borderRadius: 12,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e5e7eb",
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <InfoItem label="Equipo" value={teamName || "Sin equipo"} />
            <Divider />
            <InfoItem label="Duración" value={durationLabel} />
            <Divider />
            <InfoItem label="Jugadores" value={playersLabel} />
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            borderRadius: 12,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e5e7eb",
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}
        >
          <InfoItem label="Pista" value={courtLabel} />
        </View>

        {/* Ejercicios / descripción */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Ejercicios del entrenamiento
        </Text>
        <View
          style={{
            marginTop: 8,
            borderRadius: 10,
            backgroundColor: "#f5f3ff",
            padding: 12,
          }}
        >
          <Text style={{ color: "#4b5563", fontSize: 13 }}>
            {description ||
              "Aún no has añadido ejercicios. Puedes hacerlo desde la pestaña Mis ejercicios."}
          </Text>
        </View>

        {/* ACCIONES: Editar / Borrar */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 30,
            marginBottom: 24,
          }}
        >
          <Pressable
            style={[styles.lightButton, { flex: 1 }]}
            onPress={handleEdit}
          >
            <Text style={styles.lightText}>Editar entrenamiento</Text>
          </Pressable>

          <Pressable
            style={[styles.darkButton, { flex: 1 }]}
            onPress={handleDelete}
          >
            <Text style={styles.darkText}>Borrar entrenamiento</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

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