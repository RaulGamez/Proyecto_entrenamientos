// app/exercise/[id].js
import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, Pressable, Alert, ActivityIndicator, Image, RefreshControl, Modal, Dimensions,} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { teamStyles as styles } from "../../components/stylesTeams";
import { CloseIcon } from "../../components/icons";
import { TrashIcon } from "../../components/icons";
import { deleteExerciseBoardPng, getExerciseById, deleteExercise } from "../../lib/queries";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function ExerciseDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);

  const fetchExercise = async () => {
    if (!id) return;
    setLoading(true);

    const { data, error } = await getExerciseById(id);

    if (error) console.log("Error loading exercise", error);

    setExercise(data || null);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchExercise();
    }, [id])
  );


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercise();
    setRefreshing(false);
  };


  const handleDelete = async () => {
    Alert.alert(
      "Eliminar ejercicio",
      "¿Seguro que quieres borrar este ejercicio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExercise(id);
            } catch (e) {
              Alert.alert(
                "Error",
                e.message || "No se pudo borrar el ejercicio"
              );
              return;
            }
            router.replace("/entrenamientos?tab=exercises");
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/exercise/edit/${id}`);
  };

  const handleGoToBoard = () => {
    router.push({
      pathname: "/pizarra",
      params: { exerciseId: String(id) },
    });
  };

  const handleDeleteBoard = () => {
    Alert.alert(
      "Borrar pizarra",
      "¿Seguro que quieres borrar la pizarra guardada?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await deleteExerciseBoardPng({
                exerciseId: String(id),
              });
              if (error) throw error;
              await fetchExercise();
            } catch (e) {
              Alert.alert("Error", e.message || "No se pudo borrar la pizarra");
            }
          },
        },
      ]
    );
  };

  const shareBoardImage = async () => {
    try {
      if (!exercise?.board_image_url) return;

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("No disponible", "Compartir no está disponible en este dispositivo.");
        return;
      }

      const fileUri =
        FileSystem.cacheDirectory + `board_${exercise.id}_${Date.now()}.png`;

      const res = await FileSystem.downloadAsync(exercise.board_image_url, fileUri);

      await Sharing.shareAsync(res.uri, {
        mimeType: "image/png",
        dialogTitle: "Compartir pizarra",
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo compartir la pizarra.");
    }
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

  if (!exercise) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>No se encontró el ejercicio</Text>
      </View>
    );
  }

  const courtLabel = exercise.court
    ? {
        full: "Pista completa",
        half: "Media pista",
        quarter: "1/4 pista",
        none: "Sin pista",
      }[exercise.court] || exercise.court
    : "Sin pista";

  const durationLabel = exercise.duration
    ? `${exercise.duration} min`
    : "-";

  const playersLabel =
    exercise.players != null && exercise.players !== ""
      ? String(exercise.players)
      : "-";

  const typeLabel = exercise.type || "Ejercicio";
  const description = exercise.description || "";

  return (
    <ScrollView style={styles.screen} 
      refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      {/* CABECERA SIMPLE + BOTÓN CERRAR */}
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
        >
          {exercise.name}
        </Text>
        <Text style={[styles.teamSubtitle, { color: "#cbd5f5" }]}>
          {typeLabel}
        </Text>

        {/* Botón cerrar en la esquina */}
        <Pressable
          onPress={() => router.replace("/entrenamientos?tab=exercises")}
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
          Información del ejercicio
        </Text>

        <Text style={{ color: "#6b7280", marginTop: 4 }}>{typeLabel}</Text>

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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <InfoItem label="Duración" value={durationLabel} />
            <Divider />
            <InfoItem label="Jugadores" value={playersLabel} />
            <Divider />
            <InfoItem label="Pista" value={courtLabel} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Descripción del ejercicio
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
            {exercise.description ||
              "No hay descripción para este ejercicio."}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Pizarra táctica
        </Text>

        {exercise.board_image_url ? (
          <View
            style={{
              marginTop: 8,
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#e5e7eb",
              backgroundColor: "#fff",
            }}
          >
            <View style={{ position: "relative" }}>
              {/* Imagen (click para ver en grande) */}
              <Pressable onPress={() => setShowBoardModal(true)}>
                <Image
                  source={{ uri: exercise.board_image_url }}
                  style={{ width: "100%", height: 220 }}
                  resizeMode="contain"
                />
              </Pressable>

              {/* ICONO PAPELERA */}
              <Pressable
                onPress={handleDeleteBoard}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 18,
                  width: 36,
                  height: 36,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                hitSlop={10}
              >
                <TrashIcon size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={{
              marginTop: 8,
              borderRadius: 10,
              backgroundColor: "#f9fafb",
              padding: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ color: "#6b7280", fontSize: 13 }}>
              Aún no has guardado ninguna pizarra para este ejercicio.
            </Text>
          </View>
        )}


        {/* BOTÓN IR A PIZARRA */}
        <Pressable
          style={[
            styles.lightButton,
            {
              marginTop: 24,
              marginBottom: 4,
              borderColor: "#4f46e5",
              borderWidth: 1,
              backgroundColor: "#eef2ff",
            },
          ]}
          onPress={handleGoToBoard}
        >
          <Text style={[styles.lightText, { color: "#1d1b7f" }]}>
            Ir a Pizarra Táctica
          </Text>
        </Pressable>

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
            <Text style={styles.lightText}>Editar ejercicio</Text>
          </Pressable>

          <Pressable
            style={[styles.darkButton, { flex: 1 }]}
            onPress={handleDelete}
          >
            <Text style={styles.darkText}>Borrar ejercicio</Text>
          </Pressable>
        </View>
      </View>
      <Modal
        visible={showBoardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBoardModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Barra superior: compartir + cerrar */}
          <View
            style={{
              position: "absolute",
              top: 40,
              right: 20,
              left: 20,
              zIndex: 10,
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            {/* Compartir */}
            <Pressable
              onPress={shareBoardImage}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18 }}>📤</Text>
            </Pressable>

            {/* Cerrar */}
            <Pressable
              onPress={() => setShowBoardModal(false)}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
            </Pressable>
          </View>

          {/* Imagen grande */}
          <Image
            source={{ uri: exercise.board_image_url }}
            style={{
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").height,
            }}
            resizeMode="contain"
          />
        </View>
      </Modal>
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
