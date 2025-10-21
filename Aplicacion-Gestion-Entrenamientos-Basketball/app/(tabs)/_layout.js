import { Tabs } from "expo-router";
import { View } from "react-native";
import { BoardIcon, HomeIcon } from "../../components/icons";

export default function TabsLayout() {
    return (
        <Tabs
        screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
        }}>
            <Tabs.Screen
            name="index"
            options={{
                title: "none",
                tabBarIcon: ({color}) => <HomeIcon color={color}/>
            }}/>

            <Tabs.Screen
            name="pizarra"
            options={{
                tabBarIcon: ({color}) => <BoardIcon color={color}/>
            }}/>
        </Tabs>
    );
}