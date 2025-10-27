import { View, Text } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useState, useEffect, useRef, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function Pizarra() {
    const bottomSheetRef = useRef(null);
    const snapPoints = ["50%"];

    return (
        <View style={{flex: 1}}>
            <Text>
                Pizarra
            </Text>
        </View>
    );
}