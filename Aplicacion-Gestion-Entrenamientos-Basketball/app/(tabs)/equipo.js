// app/(tabs)/equipo.js
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { teamStyles as tstyles } from "../../components/stylesTeams";
import { TeamCard } from "../../components/TeamCard";
import { TeamsCreator } from "../../components/TeamsCreator";
import { getUserTeams, getUserPlayers } from "../../lib/queries";
import { PlayersCreator } from "../../components/PlayersCreator";

/* ---------- Helpers puros (no dependen de teams) ---------- */
function roleLabel(role) {
  const map = { "1": "Base", "2": "Escolta", "3": "Alero", "4": "Ala-Pívot", "5": "Pívot" };
  if (role == null || role === "") return null;
  return map[String(role)] || String(role);
}
function statusChipText(status) {
  if (!status) return "";
  return status.toLowerCase() === "active" ? "Activo" : status;
}

export default function Teams() {
  const router = useRouter();

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

  // Mapa id->nombre de equipos (depende de teams, así que va DENTRO del comp.)
  const teamNameById = useMemo(() => {
    const m = {};
    for (const t of teams) m[t.id] = t.name;
    return m;
  }, [teams]);

  // Helpers que sí usan teamNameById (defínelos dentro del componente)
  function formatPlayerMeta(p) {
    const parts = [];
    const role = roleLabel(p.role);
    if (role) parts.push(role);
    if (p.age !== null && p.age !== undefined && String(p.age) !== "") parts.push(`${p.age} años`);
    if (p.height) parts.push(p.height);
    if (p.team_id) parts.push(teamNameById[p.team_id] ?? "Sin Equipo");
    else parts.push("Sin Equipo");
    return parts.length ? parts.join(" • ") : "Sin posición";
  }

  // Card/row de jugador (dentro para acceder a helpers y teamNameById)
  const PlayerRow = ({ player, onPress }) => (
    <Pressable onPress={onPress} style={tstyles.playerRow}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600" }}>
          {player.number ? `#${player.number} ` : ""}{player.name}
        </Text>
        <Text style={{ color: "#6b7280", marginTop: 2 }}>
          {formatPlayerMeta(player)}
        </Text>
      </View>
      {!!player.status && (
        <Text
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: "#dcfce7",
            color: "#166534",
            fontWeight: "600",
          }}
        >
          {statusChipText(player.status)}
        </Text>
      )}
    </Pressable>
  );

  const openTeamsCreator = () => bsTeamsRef.current?.expand();
  const closeTeamsCreator = () => bsTeamsRef.current?.close();
  const openPlayersCreator = () => bsPlayersRef.current?.expand();
  const closePlayersCreator = () => bsPlayersRef.current?.close();

  return (
    <View style={tstyles.screen}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#000",
          headerTitle: "Equipos",
        }}
      />

      {cardsLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(team) => String(team.id)}
          renderItem={({ item }) => (
            <TeamCard team={item} onPress={() => router.push(`/team/${item.id}`)} />
          )}
          ListHeaderComponent={() => (
            <View style={tstyles.listHeader}>
              <Text style={tstyles.pageTabs}>
                <Text style={tstyles.tabActive}>Plantilla</Text>
                <Text style={tstyles.tabSpacer}>   </Text>
                <Text style={tstyles.tabInactive}>Estadísticas</Text>
              </Text>

              <Text style={tstyles.sectionTitle}>
                Mis Equipos <Text style={tstyles.sectionCount}>({teams.length})</Text>
              </Text>

              <View style={tstyles.headerActions}>
                <Pressable style={tstyles.chip} onPress={openPlayersCreator}>
                  <Text style={tstyles.chipText}>+ Jugador</Text>
                </Pressable>
                <Pressable style={[tstyles.chip, tstyles.chipDark]} onPress={openTeamsCreator}>
                  <Text style={[tstyles.chipText, tstyles.chipTextDark]}>+ Equipo</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
              <Text style={tstyles.sectionTitle}>
                Mis Jugadores <Text style={tstyles.sectionCount}>({players.length})</Text>
              </Text>

              {players.length === 0 ? (
                <Text style={{ color: "#9ca3af", marginTop: 8 }}>
                  Todavía no has creado jugadores
                </Text>
              ) : (
                players.map((p) => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    onPress={() => router.push(`../team/players/${p.id}`)}
                  />
                ))
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
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
        onClose={closePlayersCreator}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <PlayersCreator
            teams={teams}
            onClose={closePlayersCreator}
            onCreated={async () => {
              await loadPlayers();   // refresca la lista
              closePlayersCreator(); // cierra el sheet
            }}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
