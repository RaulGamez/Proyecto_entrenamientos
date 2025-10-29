import { View, Text, ActivityIndicator } from "react-native";
import { Main } from "../../components/Main";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContexts";

export default function Index() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            //router.replace("/login");
        }
    }, [loading, user]);

    /*
    if (loading || !user) { // Si aun esta cargando o no ha encontrado sesion muestra el icono de cargando hasta que redirija la pantalla
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }
        */

    // Si hay sesion renderiza el Main
    return <Main />;
}