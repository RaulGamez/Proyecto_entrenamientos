import { View, Text, Pressable } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useState, useEffect, useRef, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LockIcon } from "../../components/icons";
import { router, Stack } from "expo-router";
import { supabase } from "../../lib/supabase";


export default function Entrenamientos() {
    return (
        <View>
            <Text>
                Entrenamientos
            </Text>
        </View>
    );
}