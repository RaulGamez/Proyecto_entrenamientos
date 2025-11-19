import { View, Text, Pressable, TouchableOpacity, ImageBackground} from "react-native";
import { teamStyles as tstyles } from "./stylesTeams";

export function PlayerCard({player, onPress}) {
    const roleLabel = (role) => {
        const map = { "1": "Base", "2": "Escolta", "3": "Alero", "4": "Ala-Pívot", "5": "Pívot" };
        if (role == null || role === "") return null;
        return map[String(role)] || String(role);
    };

    const statusChipText = (status) => {
        if (!status) return "";
        return status.toLowerCase() === "active" ? "Activo" : (status || "");
    }

    const formatPlayerMeta = (p) => {
        const parts = [];
        const role = roleLabel(p.role);
        if (role) parts.push(role);
        if (p.age !== null && p.age !== undefined && String(p.age) !== "") parts.push(p.age);
        if (p.height) parts.push(p.height);

        let teamsText = "Sin Equipo";
        if (p.teams.length > 0)
            teamsText = p.teams[0].name;
        if (p.teams.length > 1)
            teamsText += " +" + (p.teams.length-1);
        parts.push(teamsText);
        return parts.length ? parts.join(" • ") : "Sin posición";
    };

    return (
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
}