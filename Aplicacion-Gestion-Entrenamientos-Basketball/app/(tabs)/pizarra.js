import { View, Text, Pressable } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useState, useEffect, useRef, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LockIcon } from "../../components/icons";
import { router, Stack } from "expo-router";
import { supabase } from "../../lib/supabase";


export default function Pizarra() {
    const bottomSheetRef = useRef(null);
    const snapPoints = ["50%"];

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut({ scope: "global" });

        if (error) {
            console.error("Error al cerrar sesion: ", error.message);
            throw error;
        }

        router.replace("/login");
    };

    return (
        <View style={{flex: 1}}>
            <Text>
                Pizarra
            </Text>
            <Stack.Screen
            options={{
                headerStyle: { backgroundColor: "#fff" },
                headerTintColor:"#000",
                headerTitle: "Inicio",
                headerRight: () => (
                    <Pressable
                    onPress={handleLogout}
                    >
                        {({pressed}) => (
                            <LockIcon
                            color={pressed ? "#ff6600" : "#000"}
                            style={{ opacity: pressed ? 0.6 : 1 }}
                            />
                        )}
                    </Pressable>
                ),
            }}
            />
        </View>
    );
}