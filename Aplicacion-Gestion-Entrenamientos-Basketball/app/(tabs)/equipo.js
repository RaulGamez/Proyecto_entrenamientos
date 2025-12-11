// app/(tabs)/equipo.js
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  TextInput,
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
import { EmptyPlayers } from "../../components/EmptyPlayers";

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
  const [playerSearch, setPlayerSearch] = useState("");

  // Carga
  const loadTeams = useCallback(async () => {
    const t = await getUserTeams();
    setTeams(t);
  }, []);
  
  const loadPlayers = useCallback(async () => {
    const {data: p, error} = await getUserPlayers();
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

  const filteredPlayers = useMemo(() => {
    const term = playerSearch.trim().toLowerCase();
    if (!term) return players;

    return players.filter((p) => {
      const name = p.name?.toLowerCase() ?? "";
      const role = p.role?.toLowerCase() ?? "";
      const status = p.status?.toLowerCase() ?? "";

      const numberStr =
        p.number != null && p.number !== "" ? String(p.number) : "";

      // por si tu RPC mete info de equipo en alguna clave
      const teamsNames = p.teams?.map(team => team.name.toLowerCase?.()) ?? [];

      return (
        name.includes(term) ||
        role.includes(term) ||
        status.includes(term) ||
        numberStr.includes(term) ||
        teamsNames.some(teamName => teamName.includes(term))
      );
    });
  }, [players, playerSearch]);

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
                    onPress={() => {
                      console.log("Item ID: " + item.id);
                      router.push(`../team/${item.id}`);
                    }}
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
                <EmptyPlayers onPress={openPlayerCreator}></EmptyPlayers>
              ) : (
                <>
                  {/* 🔎 Buscador de jugadores */}
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar por nombre, nº, posición, estado…"
                      placeholderTextColor="#9ca3af"
                      value={playerSearch}
                      onChangeText={setPlayerSearch}
                    />
                  </View>

                  {filteredPlayers.length === 0 ? (
                    <Text style={{ color: "#6b7280", marginTop: 12 }}>
                      No hay jugadores que coincidan con la búsqueda.
                    </Text>
                  ) : (
                    <FlatList
                      data={filteredPlayers}
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
                </>
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
  searchContainer: {
    marginBottom: 8,
    marginTop: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    fontSize: 14,
    color: "#111827",
  },
});