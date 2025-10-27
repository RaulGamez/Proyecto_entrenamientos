import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { supabase } from "../lib/supabase";
import { useUser } from "../contexts/UserContexts";
import { styles } from "./styles";
import { validateUsername } from "../lib/validators";

export function TeamsCreator({ onClose, onCreated }) {
    const { user, loading } = useUser();
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState("");
    const [name, setName] = useState("");

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );

    }

    const handleSaveTeam = async () => {
        setError("");
        setSaveLoading(true);

        const { data: teamData, error: insertError } = await supabase
        .from("teams")
        .insert([{
            name: name,
            created_by: user?.id,
        },])
        .select("id"); // Recuperamos el id

        if (insertError) {
            setError(insertError.message);
            setSaveLoading(false);
            return;
        }

        const teamId = teamData?.[0]?.id;

        const { error: relationError } = await supabase
        .from("users_teams")
        .insert([{
            user_id: user.id,
            team_id: teamId,
        },])

        setSaveLoading(false);

        if (relationError) {
            setError(relationError.message);
            return;
        }

        if (onCreated) await onCreated();
        if (onClose) await onClose();
    };


    return (
        <View>
            <TextInput
            placeholder="Nombre del equipo"
            placeholderTextColor="#999"
            style={styles.input}
            value={name}
            onChangeText={(text) => {
                setName(text);
                const errorMsg = validateUsername(text);
                setError(errorMsg || "");
            }}
            autoCapitalize="none"
            autoCorrect={false}
            />
            {error ? <Text style={[styles.error, {width: 250}]}>{error}</Text> : null}

            <Pressable
            onPress={handleSaveTeam}
            disabled={saveLoading || !name || !!error}
            style={({ pressed }) => [
            styles.lightButton,
            { width: 250, marginBottom: 20 },
            (pressed || saveLoading) && { backgroundColor: "#8a4200" }
            ]}>
                <Text style={styles.lightText}>
                    {saveLoading ? "Cargando..." : "Crear equipo"}
                </Text>
            </Pressable>
        </View>
    );
}