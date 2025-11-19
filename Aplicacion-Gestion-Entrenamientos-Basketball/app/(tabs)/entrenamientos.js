import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "../../lib/supabase";
import { TrainingCreator } from "../../components/TrainingCreator";
import { teamStyles as tstyles } from "../../components/stylesTeams";


export default function Entrenamientos() {
    const snapPoints = useMemo(() => ["40%", "80%", "100%"], []);
    const bsRef = useRef(null);
    const openCreator = () => bsRef.current?.expand();
    const closeCreator = () => bsRef.current?.close();

    return (
        <View style={tstyles.screen}>
            <Text>
                Entrenamientos
            </Text>

            <Pressable style={tstyles.chip} onPress={openCreator}>
                <Text style={tstyles.chipText}>+ Entrenamiento</Text>
            </Pressable>

            <BottomSheet
                ref={bsRef}
                snapPoints={snapPoints}
                index={-1}
                enablePanDownToClose
                onClose={closeCreator}
            >
                <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                    <TrainingCreator
                        onClose={closeCreator}
                        onCreated={closeCreator}
                    />
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    );
}