import { View, Text, Pressable} from "react-native";
import { teamStyles as tstyles } from "./stylesTeams";

export function EmptyPlayers(onPress) {
    return (
        <View style={tstyles.emptyCard}>
            <View style={tstyles.emptyIconCircle}>
                <Text style={{ fontSize: 26 }}>👤</Text>
            </View>
            <Text style={tstyles.emptyText}>Aún no has creado ningún jugador</Text>
            <Pressable style={tstyles.primaryButton} onPress={onPress}>
                <Text style={tstyles.primaryButtonText}>
                + Crear tu primer jugador
                </Text>
            </Pressable>
        </View>
    );
}