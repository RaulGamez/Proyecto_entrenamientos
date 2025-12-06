// app/(tabs)/equipo.js
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { teamStyles as tstyles } from "../../components/stylesTeams";
import { TeamCard } from "../../components/TeamCard";
import { TeamsCreator } from "../../components/TeamsCreator";
import { getUserTeams, getUserPlayers } from "../../lib/queries";
import { PlayerCreator } from "../../components/PlayerCreator";
import { PlayerCard } from "../../components/PlayerCard";

export default function Teams() {
  const router = useRouter();

  // Tabs: 'teams' | 'players'
  const [activeTab, setActiveTab] = useState("teams");

  // BottomSheets
  const bsTeamsRef = useRef(null);
  const bsPlayersRef = useRef(null);
  const snapPoints = useMemo(() => ["40%", "80%", "100%"], []);

  // Datos
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  // Carga
  const loadTeams = useCallback(async () => {
    const t = await getUserTeams();
    setTeams(t);
  }, []);
  
  const loadPlayers = useCallback(async () => {
    const p = await getUserPlayers();
    setPlayers(p);
  }, []);

  useEffect(() => {
    (async () => {
      setCardsLoading(true);
      await Promise.all([loadTeams(), loadPlayers()]);
      setCardsLoading(false);
    })();
  }, [loadTeams, loadPlayers]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadTeams(), loadPlayers()]);
      return () => {};
    }, [loadTeams, loadPlayers])
  );

  // (por si lo necesitas en otros sitios)
  const teamNameById = useMemo(() => {
    const m = {};
    for (const t of teams) m[t.id] = t.name;
    return m;
  }, [teams]);

  const openTeamsCreator = () => bsTeamsRef.current?.expand();
  const closeTeamsCreator = () => bsTeamsRef.current?.close();
  const openPlayerCreator = () => bsPlayersRef.current?.expand();
  const closePlayerCreator = () => bsPlayersRef.current?.close();

  // === EMPTY STATES usando stylesTeams ===
  const renderEmptyTeams = () => (
    <View style={tstyles.emptyCard}>
      <View style={tstyles.emptyIconCircle}>
        <Text style={{ fontSize: 26 }}>🏀</Text>
      </View>
      <Text style={tstyles.emptyText}>Aún no has creado ningún equipo</Text>
      <Pressable style={tstyles.primaryButton} onPress={openTeamsCreator}>
        <Text style={tstyles.primaryButtonText}>
          + Crear tu primer equipo
        </Text>
      </Pressable>
    </View>
  );

  const renderEmptyPlayers = () => (
    <View style={tstyles.emptyCard}>
      <View style={tstyles.emptyIconCircle}>
        <Text style={{ fontSize: 26 }}>👤</Text>
      </View>
      <Text style={tstyles.emptyText}>Aún no has creado ningún jugador</Text>
      <Pressable style={tstyles.primaryButton} onPress={openPlayerCreator}>
        <Text style={tstyles.primaryButtonText}>
          + Crear tu primer jugador
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={tstyles.screen}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#000",
          headerTitle: "Equipos",
        }}
      />

      {/* Tabs como en entrenamientos.js */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "teams" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("teams")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "teams" && styles.tabButtonTextActive,
            ]}
          >
            Mis Equipos
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            activeTab === "players" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("players")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "players" && styles.tabButtonTextActive,
            ]}
          >
            Mis Jugadores
          </Text>
        </Pressable>
      </View>

      {cardsLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          {/* TAB EQUIPOS */}
          {activeTab === "teams" && (
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>
                  Mis equipos creados ({teams.length})
                </Text>
                <Pressable
                  style={styles.smallCreateButton}
                  onPress={openTeamsCreator}
                >
                  <Text style={styles.smallCreateButtonText}>+ Crear</Text>
                </Pressable>
              </View>

              {teams.length === 0 ? (
                renderEmptyTeams()
              ) : (
                <FlatList
                  data={teams}
                  keyExtractor={(team) => String(team.id)}
                  renderItem={({ item }) => (
                    <TeamCard
                    team={item}
                    onPress={() => router.push(`../team/${item.id}`)}
                  />
                  )}
                  contentContainerStyle={{ paddingVertical: 12 }}
                />
              )}
            </View>
          )}

          {/* TAB JUGADORES */}
          {activeTab === "players" && (
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>
                  Mis jugadores creados ({players.length})
                </Text>
                <Pressable
                  style={styles.smallCreateButton}
                  onPress={openPlayerCreator}
                >
                  <Text style={styles.smallCreateButtonText}>+ Crear</Text>
                </Pressable>
              </View>

              {players.length === 0 ? (
                renderEmptyPlayers()
              ) : (
                <FlatList
                  data={players}
                  keyExtractor={(p) => String(p.id)}
                  renderItem={({ item }) => (
                    <PlayerCard
                      player={item}
                      onPress={() => router.push(`../team/players/${item.id}`)}
                    />
                  )}
                  contentContainerStyle={{ paddingVertical: 12 }}
                />
              )}
            </View>
          )}
        </>
      )}

      {/* BottomSheet: crear equipo */}
      <BottomSheet
        ref={bsTeamsRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        onClose={closeTeamsCreator}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <TeamsCreator
            onClose={closeTeamsCreator}
            onCreated={async () => {
              await loadTeams();
              closeTeamsCreator();
            }}
          />
        </BottomSheetScrollView>
      </BottomSheet>

      {/* BottomSheet: crear jugador */}
      <BottomSheet
        ref={bsPlayersRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        onClose={closePlayerCreator}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <PlayerCreator
            teams={teams}
            onClose={closePlayerCreator}
            onCreated={async () => {
              await loadPlayers();   // refresca la lista
              closePlayerCreator();  // cierra el sheet
            }}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  // Tabs (igual estilo que entrenamientos.js)
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 4,
    borderRadius: 999,
    marginBottom: 16,
    marginTop: 8,
    marginHorizontal: 16,
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

  // Header + botón crear (como entrenamientos.js)
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
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
});