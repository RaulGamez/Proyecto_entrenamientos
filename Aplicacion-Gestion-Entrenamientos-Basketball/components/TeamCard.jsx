import { View, Text } from "react-native";
import { styles } from "./styles";

export function TeamCard({team}) {
    const formattedDate = new Date(team.created_at).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <View
        key={team.id}
        style={styles.teamCard}
        >
            <Text style={styles.title}>{team.name}</Text>
            <Text>{`Created on ${formattedDate} ${team.creator ? "by " + team.creator?.username : ""}`}</Text>
        </View>
    );
}