import "react-native-url-polyfill/auto";
import { Slot } from "expo-router";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../components/styles";

export default function Layout() {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaProvider>
            <View style={{flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: "#000"}}>
                <StatusBar style="light" />
                <Slot />
            </View>
        </SafeAreaProvider>
    );
}