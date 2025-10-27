import { Tabs } from "expo-router";
import { View } from "react-native";
import { BoardIcon, HomeIcon, TeamIcon } from "../../components/icons";

export default function TabsLayout() {
    return (
        <Tabs
        screenOptions={{
            headerShown: true, // titulo en la parte superior
            tabBarShowLabel: false, // textos debajo de los iconos de la barra inferior
        }}>
            <Tabs.Screen
            name="index"
            options={{
                title: "Inicio",
                tabBarIcon: ({color}) => <HomeIcon color={color}/>
            }}/>

            <Tabs.Screen
            name="equipo"
            options={{
                title: "Equipos",
                tabBarIcon: ({color}) => <TeamIcon color={color}/>
            }}/>

            <Tabs.Screen
            name="pizarra"
            options={{
                title: "Pizarra",
                tabBarIcon: ({color}) => <BoardIcon color={color}/>
            }}/>
        </Tabs>
    );
}