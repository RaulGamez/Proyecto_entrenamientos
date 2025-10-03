import { View, Text } from "react-native";
import { Main } from "../components/Main";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        //router.replace("/login"); // descomentar para acceder a la ventana Login
    }, []);

    return <Main />;
}