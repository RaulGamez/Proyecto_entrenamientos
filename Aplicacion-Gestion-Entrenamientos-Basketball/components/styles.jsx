import { StyleSheet, Dimensions} from "react-native";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        backgroundColor: "#fff"
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#000",
    },

    input: {
        width: 250,
        color: "#fff",
        backgroundColor: "#222",
        borderWidth: 1,
        borderColor: "#999",
        borderRadius: 5,
        marginTop: 10,
        numberOfLines: 1,
        ellipsizeMode: "head",
        scrollEnabled: false,
        paddingHorizontal: 10,
        fontSize: 12,
    },

    lightButton: {
        backgroundColor: "#ac5300",
        marginTop: 10,
        borderRadius: 5,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    lightText: {
        color: "#fff",
        fontSize: 12,
    },
    
    link: {
        color: "#ff9531ff",
        fontSize: 12,
    },

    error: {
        color: "#c00",
        fontSize: 12,
    },

    /////////////// MAIN ///////////////
    // Contenido del Scroll
    scrollContent: {
        paddingHorizontal: 0,
        paddingTop: 24,
        paddingBottom: 40,
    },

    // Bloque informativo superior
    infoBlock: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e6e6e6",
        padding: 16,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
        marginBottom: 8,
    },
    infoParagraph: {
        fontSize: 14,
        lineHeight: 20,
        color: "#333",
    },

    // Espaciador grande antes del calendario
    bigSpacer: {
        height: 44,
    },

    // ---- CABECERA / NAV ----
    topBar: {
        width: SCREEN_WIDTH-25,
        paddingHorizontal: 66,
        paddingTop: 2,
        paddingBottom: 0,
    },
    navRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 0,
    },
    monthTitle: {
        color: "#000",
        fontSize: 18,
        fontWeight: "700",
        textTransform: "capitalize",
    },
    navBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#FFF",
    },
    navBtnText: { color: "#000", fontSize: 18, fontWeight: "700" },
    

    // ---- CALENDARIO ----
    calendarCard: {
        width: SCREEN_WIDTH - 25,
        height: SCREEN_HEIGHT - 220,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#0f0f0f",
        borderWidth: 1,
        borderColor: "#1f1f1f",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    loaderBox: { flex: 1, alignItems: "center", justifyContent: "center" },
    loaderText: { color: "#fff", marginTop: 8 },

    eventChip: {
        marginHorizontal: 4,
        marginVertical: 2,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: "#8B5CF6",
    },
    eventText: { color: "#fff", fontSize: 11 },
    eventTime: { fontWeight: "700" },

    // ---- MODAL INTRODUCIR EVENTO EN DICCIONARIO ----
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    modalCard: {
        width: "100%",
        backgroundColor: "#121212",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#222",
    },
    modalTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    modalSub: {
        color: "#aaa",
        marginBottom: 12,
        textTransform: "capitalize",
    },
    modalInput: {
        width: "100%",
        color: "#fff",
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
        fontSize: 14,
    },
    timeRow: { flexDirection: "row", gap: 10 },
    timeInput: { flex: 1 },

    modalActions: {
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    modalRightActions: {
        flexDirection: "row",
        gap: 10,
        },

    modalDelete: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        backgroundColor: "#e04545",
        },
    modalDeleteText: {
        color: "#fff",
        fontWeight: "700",
        },
        
    modalBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        backgroundColor: "#222",
    },
    modalBtnText: { color: "#fff", fontWeight: "600" },
    modalCancel: { backgroundColor: "#222" },
    modalSave: { backgroundColor: "#ff9531" },
    modalSaveText: { color: "#fff" },
    error: { color: "#c00", fontSize: 12 },

    /////////////// TEAMS ///////////////
    teamCard: {
        flex: 1,
        width: 370,
        height: 90,
        padding: 12,
        backgroundColor: "#fff",
        marginBottom: 10,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 12,
    },
});