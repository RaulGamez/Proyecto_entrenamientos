// app/(tabs)/entrenamientos.js
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet, ImageBackground} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "../../lib/supabase";
import { TrainingCreator } from "../../components/TrainingCreator";
import { ExerciseCreator } from "../../components/ExerciseCreator";
import { teamStyles as tstyles } from "../../components/stylesTeams";


export default function Entrenamientos() {
  const router = useRouter();
  const snapPoints = useMemo(() => ["40%", "80%", "100%"], []);
  const bsRef = useRef(null);

  const [activeTab, setActiveTab] = useState("trainings"); // 'trainings' | 'exercises'
  const [creatorMode, setCreatorMode] = useState(null);
  const [trainings, setTrainings] = useState([]);          // TODO: cargar de Supabase
  const [exercises, setExercises] = useState([]);          // TODO: cargar de Supabase
  const [loadingTrainings, setLoadingTrainings] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);

  const openTrainingCreator = () => {
    setCreatorMode("training");
    bsRef.current?.expand();
  };
  const openExerciseCreator = () => {
    setCreatorMode("exercise");
    bsRef.current?.expand();
  };
  const closeCreator = () => {
    setCreatorMode(null);
    bsRef.current?.close();
  };

  const handleTrainingCreated = () => {
    fetchTrainings();
    closeCreator();
    setActiveTab("trainings");
  };

  const handleExerciseCreated = () => {
    fetchExercises();
    closeCreator();
    setActiveTab("exercises");
  };

  const fetchTrainings = useCallback(async () => {
    setLoadingTrainings(true);
    try {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("date", { ascending: false }); // ajusta si tu columna de orden es otra

      if (error) throw error;
      setTrainings(data || []);
    } catch (e) {
      console.error("Error cargando trainings", e);
    } finally {
      setLoadingTrainings(false);
    }
  }, []);

  const fetchExercises = useCallback(async () => {
    setLoadingExercises(true);
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExercises(data || []);
    } catch (e) {
      console.error("Error cargando ejercicios", e);
    } finally {
      setLoadingExercises(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrainings();
      fetchExercises();
    }, [fetchTrainings, fetchExercises])
  );

  const goToExercisesTab = () => {
    setActiveTab("exercises");
    closeCreator();
  };

  const renderEmptyTrainings = () => (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconCircle}>
        <Text style={{ fontSize: 26 }}>🏀</Text>
      </View>
      <Text style={styles.emptyText}>Aún no has creado ningún entrenamiento</Text>
      <Pressable style={styles.primaryButton} onPress={openTrainingCreator}>
        <Text style={styles.primaryButtonText}>
          + Crear tu primer entrenamiento
        </Text>
      </Pressable>
    </View>
  );

  const renderEmptyExercises = () => (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconCircle}>
        <Text style={{ fontSize: 26 }}>📋</Text>
      </View>
      <Text style={styles.emptyText}>Aún no has creado ningún ejercicio</Text>
      <Pressable style={styles.primaryButton} onPress={openExerciseCreator}>
        <Text style={styles.primaryButtonText}>
          + Crear tu primer ejercicio
        </Text>
      </Pressable>
    </View>
  );

  const renderTrainingCard = ({ item }) => {
    const courtLabel = item.court_label || "Sin pista";
    const players = item.players || "-";
    const duration = item.duration ? `${item.duration} min` : "-";
    
    const coverSource = item.cover_url
        ? { uri: item.cover_url }
        : require("../../img/train.jpg");   
    
    const goToDetail = () => {
      router.push({
        pathname: "/training/[id]",
        params: { id: item.id },
      });
    };

    return (
      <Pressable style={styles.trainingCard} onPress={goToDetail}>
        <View style={styles.trainingImageWrapper}>
            <ImageBackground
                source={coverSource}
                style={styles.trainingImage}
                imageStyle={styles.trainingImageStyle}
            >
            <View style={styles.trainingImageOverlay}>
                <View style={styles.teamChip}>
                <Text style={styles.teamChipText}>
                    {item.team_name || "Sin equipo"}
                </Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>
            </ImageBackground>
        </View>

        {/* Stats 3 columnas */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#dbf7fbff" }]}>
            <Text style={styles.statLabel}>Duración</Text>
            <Text style={styles.statValue}>{duration}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#dbf7fbff" }]}>
            <Text style={styles.statLabel}>Jugadores</Text>
            <Text style={styles.statValue}>{players}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#dbf7fbff" }]}>
            <Text style={styles.statLabel}>Pista</Text>
            <Text style={styles.statValue}>{courtLabel}</Text>
          </View>
        </View>

        {/* Ejercicios */}
        <Text style={styles.sectionLabel}>Ejercicios del entrenamiento:</Text>
        <View style={styles.exercisesBox}>
          <Text style={styles.exercisesText}>
            {item.description || "Añade ejercicios desde la pestaña Mis ejercicios"}
          </Text>
        </View>

        {item.description ? (
          <Text style={styles.descriptionText}>{item.description}</Text>
        ) : null}
      </Pressable>
    );
  };

  const renderExerciseCard = ({ item }) => {
    const duration = item.duration ? `${item.duration} min` : "-";
    const players = item.players || "-";
    const courtLabel = item.court
        ? {
            full: "Pista completa",
            half: "Media pista",
            quarter: "1/4 pista",
            none: "Sin pista",
        }[item.court] || item.court
        : "Sin pista";

    const typeLabel = item.type || "Ejercicio";

    const goToDetail = () => {
        router.push({
        pathname: "/exercise/[id]",
        params: { id: item.id },
        });
    };

    return (
        <Pressable style={styles.trainingCard} onPress={goToDetail}>
        <View
            style={{
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: 6,
            }}
        >
            <Text
            style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 4,
            }}
            >
            {item.name}
            </Text>
            <Text
            style={{
                fontSize: 12,
                color: "#6b7280",
            }}
            >
            {typeLabel}
            </Text>
        </View>

        <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#dbf7fbff" }]}>
            <Text style={styles.statLabel}>Duración</Text>
            <Text style={styles.statValue}>{duration}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#dbf7fbff" }]}>
            <Text style={styles.statLabel}>Jugadores</Text>
            <Text style={styles.statValue}>{players}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#dbf7fbff" }]}>
            <Text style={styles.statLabel}>Pista</Text>
            <Text style={styles.statValue}>{courtLabel}</Text>
            </View>
        </View>

        {item.description ? (
            <View
            style={{ marginHorizontal: 10, marginBottom: 10, marginTop: 6 }}
            >
            <Text style={styles.exercisesText}>{item.description}</Text>
            </View>
        ) : null}
        </Pressable>
    );
    };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[tstyles.screen, { paddingHorizontal: 16, paddingTop: 16 }]}>
        <Stack.Screen options={{ title: "Entrenamientos" }} />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[
              styles.tabButton,
              activeTab === "trainings" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("trainings")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "trainings" && styles.tabButtonTextActive,
              ]}
            >
              Mis Entrenamientos
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabButton,
              activeTab === "exercises" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("exercises")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "exercises" && styles.tabButtonTextActive,
              ]}
            >
              Mis Ejercicios
            </Text>
          </Pressable>
        </View>

        {/* TAB ENTRENAMIENTOS */}
        {activeTab === "trainings" && (
          <View style={{ flex: 1 }}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>
                Mis entrenamientos creados ({trainings.length})
              </Text>
              <Pressable style={styles.smallCreateButton} onPress={openTrainingCreator}>
                <Text style={styles.smallCreateButtonText}>+ Crear</Text>
              </Pressable>
            </View>

            {loadingTrainings ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : trainings.length === 0 ? (
              renderEmptyTrainings()
            ) : (
              <FlatList
                data={trainings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 12 }}
                renderItem={renderTrainingCard}
              />
            )}
          </View>
        )}

        {/* TAB EJERCICIOS */}
        {activeTab === "exercises" && (
          <View style={{ flex: 1 }}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>
                Mis ejercicios creados ({exercises.length})
              </Text>
            <Pressable
                style={styles.smallCreateButton}
                onPress={openExerciseCreator}
              >
                <Text style={styles.smallCreateButtonText}>+ Crear</Text>
              </Pressable>
            </View>


            {loadingExercises ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : exercises.length === 0 ? (
              renderEmptyExercises()
            ) : (
              <FlatList
                data={exercises}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 12 }}
                renderItem={renderExerciseCard}
              />
            )}
          </View>
        )}

        {/* BottomSheet creador (entreno / ejercicio) */}
        <BottomSheet
          ref={bsRef}
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose
          onClose={closeCreator}
        >
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {creatorMode === "training" && (
              <TrainingCreator
                onClose={closeCreator}
                onCreated={handleTrainingCreated}
                onGoToExercisesTab={goToExercisesTab}
              />
            )}
            {creatorMode === "exercise" && (
              <ExerciseCreator
                onClose={closeCreator}
                onCreated={handleExerciseCreated}
                onGoToBoard={() => {
                  closeCreator();          // cerramos el bottom sheet
                  router.push("/pizarra"); // navegamos a la pestaña Pizarra
                }}
              />
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 4,
    borderRadius: 999,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#ffffff",
  },
  tabButtonText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: "#111827",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  smallCreateButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  smallCreateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#d1d1d1ff",
    alignItems: "center",
    gap: 12,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#edeff2ff",
  },
  emptyText: {
    color: "#4b5563",
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#edeff2ff",
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },

  // tarjeta de entrenamiento
  trainingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  trainingImageWrapper: {
    position: "relative",
    height: 110,
    backgroundColor: "#0f172a",
  },
  trainingImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  trainingImageStyle: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    },
  trainingImageOverlay: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  teamChip: {
    backgroundColor: "rgba(15,23,42,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  teamChipText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  dateText: {
    color: "#ffffffff",
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  sectionLabel: {
    marginTop: 12,
    marginHorizontal: 10,
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  exercisesBox: {
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 10,
    borderColor: "#98d5f4ff",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  exercisesText: {
    fontSize: 13,
    color: "#4b5563",
  },
  descriptionText: {
    marginTop: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    fontSize: 13,
    color: "#4b5563",
  },
});