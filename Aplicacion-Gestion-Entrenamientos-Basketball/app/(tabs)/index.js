import { View, Text, ActivityIndicator } from "react-native";
import { Main } from "../../components/Main";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Index() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setLoading(false);
        };

        checkSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!loading && !session) {
            //router.replace("/login");
        }
    }, [loading, session]);

    if (false && (loading || !session)) { // Si aun esta cargando o no ha encontrado sesion muestra el icono de cargando hasta que redirija la pantalla
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    // Si hay sesion renderiza el Main
    return <Main />;
}