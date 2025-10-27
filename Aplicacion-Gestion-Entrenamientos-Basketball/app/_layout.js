import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../components/styles";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "../contexts/UserContexts";

export default function Layout() {
    const insets = useSafeAreaInsets();

    return (
        <GestureHandlerRootView>
            <SafeAreaProvider>
                <View style={{flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom}}>
                    <StatusBar style="dark" />
                    <UserProvider>
                        <Stack
                        screenOptions={{
                            headerShown: false,
                            headerStyle: { backgroundColor: "#fff" },
                            headerTintColor: "#000",
                        }}
                        />
                    </UserProvider>
                </View>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}