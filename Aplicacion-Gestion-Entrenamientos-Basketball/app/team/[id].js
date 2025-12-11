// app/team/[id].js
// Pantalla de detalle del equipo
import { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, ImageBackground, ActivityIndicator, Pressable, FlatList, Alert, Modal, TextInput, Platform, StyleSheet} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { teamStyles as styles } from "../../components/stylesTeams";
import { ProgressBar } from "../../components/ProgressBar";
import { EmptyPlayers } from "../../components/EmptyPlayers";
import { CloseIcon } from "../../components/icons";
import { getTeamById, getUserPlayers, createPlayer, updateTeamPlayers } from "../../lib/queries";
import { PlayerCard } from "../../components/PlayerCard";


export default function TeamDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // listas
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // modales
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);

  // form partido
  const [opponent, setOpponent] = useState("");
  const [matchDate, setMatchDate] = useState(""); // dd/mm/yyyy o yyyy-mm-dd
  const [ourPts, setOurPts] = useState("");
  const [oppPts, setOppPts] = useState("");
  const [savingMatch, setSavingMatch] = useState(false);

  // Player Picker
  const [allPlayers, setAllPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [selectedPlayersIds, setSelectedPlayersIds] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // form jugador
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerAge, setPlayerAge] = useState("");
  const [playerRole, setPlayerRole] = useState("");
  const [playerHeight, setPlayerHeight] = useState("");
  const [savingPlayer, setSavingPlayer] = useState(false);

  // paginación
  const PAGE_SIZE_MATCHES = 10;
  const PAGE_SIZE_PLAYERS = 10;
  const [loadingMoreMatches, setLoadingMoreMatches] = useState(false);
  const [loadingMorePlayers, setLoadingMorePlayers] = useState(false);

  const fetchAll = async () => {
    setLoading(true);

    console.log("ID: "+id);

    const { data, error } = await getTeamById(id);
    if (error) return;

    console.log(`getTeamById data:\n${data}`);

    setTeam({
      id: data.id,
      name: data.name,
      category: data.category,
      players_target: data.players_target,
      goals: data.goals,
      training_days: data.training_days,
      cover_url: data.cover_url,
      created_at: data.created_at,
      creator: data.creator,
    });
    setMatches(data.matches ?? []);
    setPlayers(data.players ?? []);

    setLoading(false);
    setLoadingExtra(false);
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const togglePlayer = (pId) => {
    setSelectedPlayersIds((prev) =>
      prev.includes(pId) ? prev.filter((x) => x !== pId) : [...prev, pId]
    );
  };

  const updateSelectedPlayers = () => {
    const currentSelectedPlayersIds = players.map((item) => item.id) || [];
    setSelectedPlayersIds(currentSelectedPlayersIds);
  }

  const handleSaveSelectedPlayers = async () => {
    const currentPlayersIds = players.map((item) => item.id);

    const {error} = await updateTeamPlayers({
      teamId: id,
      currentPlayersIds: currentPlayersIds,
      selectedPlayersIds: selectedPlayersIds
    });

    if (error) throw error;
  }

  const handleDelete = async () => {
    Alert.alert("Eliminar equipo", "¿Seguro que quieres borrar este equipo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          await supabase.from("teams").delete().eq("id", id);
          router.back();
        },
      },
    ]);
  };

  const filteredPlayers = useMemo(() => {
    const term = playerSearch.trim().toLowerCase();
    if (!term) return allPlayers;

    return allPlayers.filter((p) => {
      const name = p.name?.toLowerCase() ?? "";
      const role = p.role?.toLowerCase() ?? "";
      const status = p.status?.toLowerCase() ?? "";

      const numberStr =
        p.number != null && p.number !== "" ? String(p.number) : "";

      //const teamsNames = p.teams?.map(team => (team?.name ?? "").toLowerCase()) ?? [];

      return (
        name.includes(term) ||
        role.includes(term) ||
        status.includes(term) ||
        numberStr.includes(term)
        //teamsNames.some(teamName => teamName.includes(term))
      );
    });
  }, [allPlayers, playerSearch]);

  // Cálculos de resumen partidos
  const { totalMatches, wins, losses } = useMemo(() => {

    const losses = matches.filter((m) => m.result === "loss");
    const wins = matches.filter((m) => m.result === "win");

    return { totalMatches: matches.length, wins: wins.length, losses: losses.length };
  }, [matches]);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );

  if (!team)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No se encontró el equipo</Text>
      </View>
    );

  const goals = team.goals || {};
  const td = team.training_days || {};
  const labels = { mon:"Lun", tue:"Mar", wed:"Mié", thu:"Jue", fri:"Vie"};
  const resumen = Object.entries(labels)
    .map(([k, lab]) => (td[k]?.enabled && td[k].start && td[k].end) ? `${lab} ${td[k].start}–${td[k].end}` : null)
    .filter(Boolean)
    .join(" · ");

  // Cargar más PARTIDOS
  const loadMoreMatches = async () => {
    if (!id || loadingMoreMatches) return;
    setLoadingMoreMatches(true);
    try {
      const from = matches.length;
      const to = from + PAGE_SIZE_MATCHES - 1;

      const { data, error } = await supabase
        .from('matches')
        .select('id, opponent, date, our_pts, opp_pts, result')
        .eq('team_id', id)
        .order('date', { ascending: false })
        .range(from, to);

      if (error) throw error;
      if (data && data.length) {
        setMatches(prev => [...prev, ...data]);
      }
    } catch (e) {
      Alert.alert('Error', e.message || String(e));
    } finally {
      setLoadingMoreMatches(false);
    }
  };

  // Cargar más JUGADORES
  const loadMorePlayers = async () => {
    if (!id || loadingMorePlayers) return;
    setLoadingMorePlayers(true);
    try {
      const from = players.length;
      const to = from + PAGE_SIZE_PLAYERS - 1;

      const { data, error } = await supabase
        .from('players')
        .select('id, name, number, role, status')
        .eq('team_id', id)
        .order('name', { ascending: true })
        .range(from, to);

      if (error) throw error;
      if (data && data.length) {
        setPlayers(prev => [...prev, ...data]);
      }
    } catch (e) {
      Alert.alert('Error', e.message || String(e));
    } finally {
      setLoadingMorePlayers(false);
    }
  };

  const fetchAllPlayers = async () => {
    setLoadingPlayers(true);

    const { data, error } = await getUserPlayers();
    if (error) return;

    setAllPlayers(data || []);

    setLoadingPlayers(false);
  };

  return (
    <ScrollView style={styles.screen}>
      {/*Player Picker*/}
      {showPlayerPicker &&
        <PlayerPicker
          visible={true}
          loadingPlayers={loadingPlayers}
          allPlayers={allPlayers}
          selectedPlayersIds={selectedPlayersIds}
          playerSearch={playerSearch}
          setPlayerSearch={setPlayerSearch}
          filteredPlayers={filteredPlayers}
          onSelectPlayer={(id) => togglePlayer(id)}
          openPlayerCreator={() => {
            setPlayerName("");
            setPlayerNumber("");
            setPlayerAge("");
            setPlayerRole("");
            setPlayerHeight("");
            setShowPlayerModal(true);
          }}
          saveSelectedPlayers={async () => {
            await handleSaveSelectedPlayers();
            await fetchAll();
            setShowPlayerPicker(false);
          }}
          onClose={async () => {
            await fetchAll();
            setShowPlayerPicker(false);
          }}
        />
      }
      
      {/* Detail del equipo*/}
      <View style={{display: showPlayerPicker ? 'none' : 'flex'}}>
        <View style={{ position: "relative" }}>
          <ImageBackground
            source={team.cover_url ? { uri: team.cover_url } : require("../../img/teams.jpg")}
            style={{ height: 220, justifyContent: "flex-end" }}
          >
            <View style={styles.teamCoverOverlay} />
            <View style={{ padding: 16 }}>
              <Text style={[styles.teamTitle, { fontSize: 20 }]}>{team.name}</Text>
              {team.category && <Text style={styles.teamSubtitle}>{team.category}</Text>}
            </View>
          </ImageBackground>

          {/* Cerrar */}
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

        <View style={{ padding: 16 }}>
          {/* INFO GENERAL */}
          <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Información general</Text>
          <Text style={{ color: "#6b7280", marginTop: 4 }}>
            Jugadores objetivo: {team.players_target || "-"}
          </Text>
          <Text style={{ color: "#6b7280" }}>
            Entrenos: {resumen || "—"}
          </Text>

          {/* RESUMEN PARTIDOS */}
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
              <SummaryItem label="Partidos" value={totalMatches} />
              <Divider />
              <SummaryItem label="Ganados" value={wins} color="#16a34a" />
              <Divider />
              <SummaryItem label="Perdidos" value={losses} color="#dc2626" />
            </View>
          </View>

          {/* OBJETIVOS */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Objetivos de entrenamiento</Text>
          <ProgressBar label="Bote" value={goals.bote || 0} />
          <ProgressBar label="Tiro" value={goals.tiro || 0} />
          <ProgressBar label="Pase" value={goals.pase || 0} />
          <ProgressBar label="Defensa" value={goals.defensa || 0} />
          <ProgressBar label="Competición" value={goals.competicion || 0} />
          <ProgressBar label="Dinámico" value={goals.dinamico || 0} />

          {/* HISTORIAL PARTIDOS */}
          <Card>
            <SectionHeader
              title={`Historial de Partidos (${matches.length})`}
              actionLabel="Añadir Resultado"
              onAction={() => {
                // reset form
                setOpponent("");
                setMatchDate(formatDate(new Date()));
                setOurPts("");
                setOppPts("");
                setShowMatchModal(true);
              }}
              dark
            />
            {loadingExtra ? (
              <Muted>Cargando historial…</Muted>
            ) : matches.length === 0 ? (
              <Muted>No hay partidos registrados aún</Muted>
            ) : (
              <>
                {matches.map((m) => (
                  <Pressable
                    key={m.id}
                    style={rowStyle}
                    onPress={() => router.push(`../team/matches/${m.id}`)}
                  >
                    <View>
                      <Text style={{ fontWeight: "600" }}>
                        {m.opponent || "Rival"} · {formatDate(m.date)}
                      </Text>
                      {"our_pts" in m && "opp_pts" in m && (
                        <Text style={{ color: "#6b7280", marginTop: 2 }}>
                          {m.our_pts} - {m.opp_pts}
                        </Text>
                      )}
                    </View>
                    <Chip
                      text={m.result === "win" ? "Ganado" : m.result === "loss" ? "Perdido" : "Empate"}
                      tone={m.result === "win" ? "success" : m.result === "loss" ? "danger" : "neutral"}
                    />
                  </Pressable>
                ))}

                {matches.length >= 5 && (
                  <Pressable
                    onPress={loadMoreMatches}
                    style={[styles.lightButton, { marginTop: 12, alignSelf: "center", paddingHorizontal: 16 }]}
                    disabled={loadingMoreMatches}
                  >
                    <Text style={styles.lightText}>
                      {loadingMoreMatches ? "Cargando…" : "Ver más partidos"}
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </Card>

          {/* JUGADORES */}
          <Card>
            <SectionHeader
              title={`Jugadores (${players.length})`}
              actionLabel="Añadir jugador"
              onAction={() => {
                updateSelectedPlayers();
                fetchAllPlayers();
                setShowPlayerPicker(true);
              }}
            />
            {loadingExtra ? (
              <Muted>Cargando jugadores…</Muted>
            ) : players.length === 0 ? (
              <Muted>No hay jugadores todavía</Muted>
            ) : (
              <>
                {players.map((p) => (
                  <Pressable
                    key={p.id}
                    style={rowStyle}
                    onPress={() => router.push(`../team/players/${p.id}`)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "600" }}>
                        {p.number ? `#${p.number} ` : ""}{p.name}
                      </Text>
                      <Text style={{ color: "#6b7280", marginTop: 2 }}>
                        {formatPlayerMetaInsideTeam(p)}
                      </Text>
                    </View>
                    {p.status && (
                      <Chip
                        text={p.status === "active" ? "Activo" : p.status}
                        tone={p.status === "active" ? "success" : "neutral"}
                      />
                    )}
                  </Pressable>
                ))}

                {players.length >= 6 && (
                  <Pressable
                    onPress={loadMorePlayers}
                    style={[styles.lightButton, { marginTop: 12, alignSelf: "center", paddingHorizontal: 16 }]}
                    disabled={loadingMorePlayers}
                  >
                    <Text style={styles.lightText}>
                      {loadingMorePlayers ? "Cargando…" : "Ver más jugadores"}
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </Card>

          {/* ACCIONES */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 30, marginBottom: 24 }}>
            <Pressable style={[styles.lightButton, { flex: 1 }]} onPress={() => router.push(`/team/edit/${team.id}`)}>
              <Text style={styles.lightText}>Editar equipo</Text>
            </Pressable>
            <Pressable style={[styles.darkButton, { flex: 1 }]} onPress={handleDelete}>
              <Text style={styles.darkText}>Borrar equipo</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* MODAL: Registrar Resultado */}
      <Modal visible={showMatchModal} transparent animationType="fade" onRequestClose={() => setShowMatchModal(false)}>
        <Backdrop onPress={() => setShowMatchModal(false)} />
        <ModalCard title="Registrar Resultado de Partido" subtitle={`Añade el resultado del partido de ${team.name}`} onClose={() => setShowMatchModal(false)}>
          <Label>Equipo Rival</Label>
          <Input placeholder="ej. Junior B" value={opponent} onChangeText={setOpponent} />

          <Label>Fecha del Partido</Label>
          <Input placeholder={formatDate(new Date())} value={matchDate} onChangeText={setMatchDate} />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Label>{team.name}</Label>
              <Input keyboardType="numeric" placeholder="Puntos" value={ourPts} onChangeText={setOurPts} />
            </View>
            <View style={{ flex: 1 }}>
              <Label>Rival</Label>
              <Input keyboardType="numeric" placeholder="Puntos" value={oppPts} onChangeText={setOppPts} />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <Pressable style={[styles.lightButton, { flex: 1 }]} onPress={() => setShowMatchModal(false)}>
              <Text style={styles.lightText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.darkButton, { flex: 1, opacity: savingMatch ? 0.7 : 1 }]}
              disabled={savingMatch}
              onPress={async () => {
                if (!opponent || !matchDate) {
                  Alert.alert("Faltan datos", "Indica rival y fecha.");
                  return;
                }
                setSavingMatch(true);
                try {
                  const our = parseInt(ourPts || "0", 10);
                  const opp = parseInt(oppPts || "0", 10);
                  const result = our > opp ? "win" : our < opp ? "loss" : "draw";
                  const iso = parseAnyDateToISO(matchDate);

                  const { error } = await supabase.from("matches").insert({
                    team_id: id,
                    opponent,
                    date: iso,
                    our_pts: our,
                    opp_pts: opp,
                    result,
                  });
                  if (error) throw error;
                  setShowMatchModal(false);
                  await fetchAll();
                } catch (e) {
                  Alert.alert("Error guardando", e.message || String(e));
                } finally {
                  setSavingMatch(false);
                }
              }}
            >
              <Text style={styles.darkText}>Guardar Resultado</Text>
            </Pressable>
          </View>
        </ModalCard>
      </Modal>

      {/* MODAL: Crear Jugador */}
      <Modal visible={showPlayerModal} transparent animationType="fade" onRequestClose={() => setShowPlayerModal(false)}>
        <Backdrop onPress={() => setShowPlayerModal(false)} />
        <ModalCard title="Crear Nuevo Jugador" subtitle="Añade un nuevo jugador a tu equipo" onClose={() => setShowPlayerModal(false)}>
          <Label>Nombre del Jugador</Label>
          <Input placeholder="ej. Carlos Martínez" value={playerName} onChangeText={setPlayerName} />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Label>Número</Label>
              <Input keyboardType="numeric" placeholder="ej. 23" value={playerNumber} onChangeText={setPlayerNumber} />
            </View>
            <View style={{ flex: 1 }}>
              <Label>Edad</Label>
              <Input keyboardType="numeric" placeholder="ej. 16" value={playerAge} onChangeText={setPlayerAge} />
            </View>
          </View>

          <Label>Posición</Label>
          <Input placeholder="ej. Base / Escolta" value={playerRole} onChangeText={setPlayerRole} />

          <Label>Altura</Label>
          <Input placeholder="ej. 1.85m" value={playerHeight} onChangeText={setPlayerHeight} />

          <Label>Equipo</Label>
          <Input value={team.name} editable={false} />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <Pressable style={[styles.lightButton, { flex: 1 }]} onPress={() => setShowPlayerModal(false)}>
              <Text style={styles.lightText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.darkButton, { flex: 1, opacity: savingPlayer ? 0.7 : 1 }]}
              disabled={savingPlayer}
              onPress={async () => {
                if (!playerName) {
                  Alert.alert("Faltan datos", "El nombre es obligatorio.");
                  return;
                }
                setSavingPlayer(true);
                try {
                  const playerInfo = {
                    name: playerName,
                    number: playerNumber ? parseInt(playerNumber, 10) : null,
                    age: playerAge ? parseInt(playerAge, 10) : null,
                    role: playerRole || null,
                    height: playerHeight || null,
                    status: "active",
                  };

                  const {data, error} = await createPlayer({player: playerInfo, teams: [id]})

                  if (error) throw error;
                  await fetchAllPlayers();
                  togglePlayer(data);
                  setShowPlayerModal(false);
                } catch (e) {
                  Alert.alert("Error guardando", e.message || String(e));
                } finally {
                  setSavingPlayer(false);
                }
              }}
            >
              <Text style={styles.darkText}>Crear Jugador</Text>
            </Pressable>
          </View>
        </ModalCard>
      </Modal>
    </ScrollView>
  );
}

/* ---------- Helpers UI ---------- */
function SummaryItem({ label, value, color }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ color: "#6b7280", fontSize: 12 }}>{label}</Text>
      <Text style={{ fontWeight: "700", fontSize: 16, color: color || "#111827" }}>{value}</Text>
    </View>
  );
}
const Divider = () => <View style={{ width: 1, backgroundColor: "#e5e7eb" }} />;
const Card = ({ children }) => (
  <View style={{ marginTop: 28, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", padding: 14 }}>
    {children}
  </View>
);
const SectionHeader = ({ title, actionLabel, onAction, dark }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
    <Text style={[{ fontSize: 16, fontWeight: "700", color: "#111827" }]}>{title}</Text>
    {!!actionLabel && (
      <Pressable
        style={[dark ? styles.darkButton : styles.lightButton, { paddingHorizontal: 12, paddingVertical: 8 }]}
        onPress={onAction}
      >
        <Text style={dark ? styles.darkText : styles.lightText}>{actionLabel}</Text>
      </Pressable>
    )}
  </View>
);
const Muted = ({ children }) => <Text style={{ color: "#9ca3af", marginTop: 8 }}>{children}</Text>;
const Chip = ({ text, tone }) => {
  const bg = tone === "success" ? "#dcfce7" : tone === "danger" ? "#fee2e2" : "#e5e7eb";
  const fg = tone === "success" ? "#166534" : tone === "danger" ? "#991b1b" : "#374151";
  return (
    <Text style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: bg, color: fg, fontWeight: "600" }}>
      {text}
    </Text>
  );
};
const rowStyle = {
  marginTop: 10,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: "#e5e7eb",
  borderRadius: 10,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
};

/* ---------- Helpers Modal & Inputs ---------- */
function PlayerPicker({
  visible,
  loadingPlayers,
  allPlayers,
  selectedPlayersIds,
  playerSearch,
  setPlayerSearch,
  filteredPlayers,
  onSelectPlayer,
  openPlayerCreator,
  saveSelectedPlayers,
  onClose,
}) {
  if (!visible) return null;
  
  return (
    <View style={{padding: 16, gap: 10}}>
      {allPlayers.length === 0 ? (
        <EmptyPlayers onPress={openPlayerCreator} />
      ) : (
        <>
          <Text style={styles.modalTitle}>Seleccionar jugadores</Text>
          <Text style={styles.modalSubtitle}>
            Toca las cartas para seleccionarlas o deseleccionarlas.
          </Text>
          <Text style={{ color: "#111827", fontSize: 13, marginBottom: 8 }}>
            Seleccionados: {selectedPlayersIds.length}
          </Text>

          {/* 🔎 Buscador de jugadores */}
          <View style={searchStyles.searchContainer}>
            <TextInput
            style={searchStyles.searchInput}
            placeholder="Buscar por nombre, nº, posición, estado…"
            placeholderTextColor="#9ca3af"
            value={playerSearch}
            onChangeText={setPlayerSearch}
            />
          </View>

          {loadingPlayers ? (
            <ActivityIndicator style={{ marginTop: 16 }} />
          ) : filteredPlayers.length === 0 ? (
            <Text style={{ color: "#6b7280", marginTop: 12 }}>
              No hay jugadores que coincidan con la búsqueda.
            </Text>
          ) : (
            <>
              {filteredPlayers.map((item) => {
                const selected = selectedPlayersIds.includes(item.id);
                
                return (
                  <PlayerCard player={item}
                  style={[
                    pickerStyles.card,
                    selected && pickerStyles.cardSelected,
                  ]}
                  key={item.id}
                  onPress={() => onSelectPlayer(item.id)}
                  />
                );
              })}
            </>
          )}

          {/* BOTÓN: CREAR NUEVO JUGADOR (cuando sí hay lista) */}
          <Pressable
            style={[styles.darkButton, { marginTop: 8 }]}
            onPress={openPlayerCreator}
          >
            <Text style={styles.darkText}>+ Crear nuevo jugador</Text>
          </Pressable>

          <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            gap: 10,
          }}
          >
            <Pressable
              style={[styles.lightButton, { flex: 1 }]}
              onPress={onClose}
            >
              <Text style={styles.lightText}>Volver</Text>
            </Pressable>

            <Pressable
              style={[styles.darkButton, { flex: 1 }]}
              onPress={saveSelectedPlayers}
            >
              <Text style={styles.darkText}>Añadir jugadores</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function Backdrop({ onPress }) {
  return (
    <Pressable onPress={onPress} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" }} />
  );
}
function ModalCard({ title, subtitle, onClose, children }) {
  return (
    <View
      style={{
        marginTop: "20%",
        marginHorizontal: 16,
        backgroundColor: "white",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 16,
        elevation: 4,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontWeight: "700", fontSize: 16 }}>{title}</Text>
          {!!subtitle && <Text style={{ color: "#6b7280", marginTop: 2 }}>{subtitle}</Text>}
        </View>
        <Pressable onPress={onClose} style={{ padding: 6 }}>
          <Text style={{ fontSize: 18 }}>✕</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}
const Label = ({ children }) => <Text style={{ color: "#6b7280", marginTop: 10, marginBottom: 6 }}>{children}</Text>;
const Input = (props) => (
  <TextInput
    {...props}
    style={[
      {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "ios" ? 12 : 10,
        backgroundColor: "#f9fafb",
      },
      props.style,
    ]}
    placeholderTextColor="#9ca3af"
  />
);

/* ---------- Utils ---------- */
function formatDate(d) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return d ?? "";
  }
}
function parseAnyDateToISO(s) {
  // acepta "dd/mm/yyyy" o "yyyy-mm-dd"
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

function formatPlayerMeta(p, teamNameOptional) {
  const parts = [];
  if (p.role) parts.push(p.role);
  if (p.age !== null && p.age !== undefined && String(p.age) !== "") {
    parts.push(`${p.age} años`);
  }
  if (p.height) parts.push(p.height);
  if (teamNameOptional) {
    parts.push(teamNameOptional);
  } else if (!p.team_id) {
    parts.push("Sin Equipo");
  }
  return parts.length ? parts.join(" • ") : "Sin posición";
}

function roleLabel(role) {
  const map = { "1": "Base", "2": "Escolta", "3": "Alero", "4": "Ala-Pívot", "5": "Pívot" };
  if (role == null || role === "") return null;
  return map[String(role)] || String(role);
}

// Dentro del detalle, siempre mostramos el equipo actual del detalle
function formatPlayerMetaInsideTeam(p) {
  const parts = [];
  const role = roleLabel(p.role);
  if (role) parts.push(role);
  if (p.age !== null && p.age !== undefined && String(p.age) !== "") parts.push(`${p.age} años`);
  if (p.height) parts.push(p.height);
  // si algún jugador viniera sin team_id, muestra “Sin Equipo”
  parts.push(p.team_id ? "" : "Sin Equipo");
  return parts.filter(Boolean).join(" • ") || "Sin posición";
}

const pickerStyles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: "#16a34a",
    borderWidth: 2,
  }
});

const searchStyles = StyleSheet.create({
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
  }
});