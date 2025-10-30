import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { styles } from "../../components/styles";
import { TeamCard } from "../../components/TeamCard";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getUserTeams } from "../../lib/queries";
import { PlusIcon } from "../../components/icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Stack, useFocusEffect } from "expo-router";
import { TeamsCreator } from "../../components/TeamsCreator";

export default function Teams() {
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ["50%", "100%"], []);

    const [teams, setTeams] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [cardsLoading, setCardsLoading] = useState(true);

    const loadTeams = useCallback(async () => {
        const teams = await getUserTeams();
        setTeams(teams);
    }, []);

    const handleOpenSheet = useCallback((index) => {
        bottomSheetRef.current?.snapToIndex(index);
        setIsOpen(true);
    }, []);

    const handleCloseSheet = useCallback(() => {
        bottomSheetRef.current?.close();
        setIsOpen(false);
    }, []);

    useEffect(() => {
        const fetchTeams = async () => {
            setCardsLoading(true);
            await loadTeams();
            setCardsLoading(false);
        };
        fetchTeams();
    }, [loadTeams]);

    useFocusEffect(
        useCallback(() => {
            loadTeams();
        }, [loadTeams])
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
            options={{
                headerStyle: { backgroundColor: "#fff" },
                headerTintColor:"#000",
                headerTitle: "Equipos",
                headerRight: () => (
                    <Pressable
                    onPress={() => handleOpenSheet(2)}
                    >
                        {({pressed}) => (
                            <PlusIcon
                            color={pressed ? "#ff6600" : "#000"}
                            style={{ opacity: pressed ? 0.6 : 1 }}
                            />
                        )}
                    </Pressable>
                ),
            }}
            />

            {cardsLoading?
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            :
                <FlatList
                data={teams}
                keyExtractor={(team) => team.id}
                renderItem={({item}) => <TeamCard team={item}/>}
                ListHeaderComponent={() => (
                    <View>
                        <Text style={styles.title}>Tus equipos</Text>
                    </View>
                )}
                />
            }

            <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            index={-1}
            enablePanDownToClose={true}
            onClose={() => setIsOpen(false)}
            >
                <BottomSheetView>
                    <TeamsCreator
                    onClose={handleCloseSheet}
                    onCreated={loadTeams}
                    />
                </BottomSheetView>
            </BottomSheet>

        </View>
    );
}