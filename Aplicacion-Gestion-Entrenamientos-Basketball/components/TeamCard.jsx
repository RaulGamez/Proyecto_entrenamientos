// components/TeamCard.jsx
// Tarjeta que muestra la info básica en la pag de equipos
import { View, Text, TouchableOpacity, ImageBackground} from "react-native";
import { teamStyles as styles } from "./stylesTeams";

export function TeamCard({team, onPress}) {
    const formattedDate = new Date(team.created_at).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    // Datos del equipo
    const category = team.category || "";
    const position = team.position || "-";
    const players =
      team.players_count && team.players_target
        ? `${team.players_count}/${team.players_target}`
        : team.players_target
        ? `${team.players_target}`
        : "-";
    const winRate =
      team.goals?.competicion != null
        ? `${team.goals.competicion}%`
        : team.win_rate != null
        ? `${team.win_rate}%`
        : "-";

    const coverSource = team.cover_url
      ? { uri: team.cover_url }
      : require("../img/teams.jpg");
    
    return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={styles.teamCard}>
        <ImageBackground
          source={coverSource}
          style={styles.teamCover}
          imageStyle={styles.teamCoverImage}
        >
          <View style={styles.teamCoverOverlay} />
          <View style={styles.teamTitleWrap}>
            <Text style={styles.teamTitle}>{team.name}</Text>
            {category ? (
              <Text style={styles.teamSubtitle}>{category}</Text>
            ) : null}
          </View>
        </ImageBackground>

        <View style={styles.metricsRow}>
          <Text style={styles.teamTitle2}>🏀 {players} Jugadores</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}