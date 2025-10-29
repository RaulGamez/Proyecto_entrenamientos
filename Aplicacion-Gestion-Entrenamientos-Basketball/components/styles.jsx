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

    // --- Bienvenida
    welcomeCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    welcomeTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
    welcomeDate: { marginTop: 2, color: "#6b7280", fontSize: 12 },

    // --- Secciones
    sectionCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 4,
        marginBottom: 14,
    },
    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111" },
    sectionCount: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
    primaryBtn: {
        backgroundColor: "#ff9531",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    primaryBtnText: { color: "#fff", fontWeight: "700" },

    // --- Navegación mes
    navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    navBtn: {
        width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center",
        backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb",
    },
    navBtnText: { fontSize: 16, color: "#111" },
    monthTitle: { fontWeight: "700", color: "#111", fontSize: 14 },


    // ---- CALENDARIO ----
    calendarCard: {
        width: SCREEN_WIDTH - 45,
        height: SCREEN_HEIGHT - 420,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#1f1f1f",
        shadowColor: "#000",
        elevation: 6,
    },

    eventChip: {
        backgroundColor: "#fff3e7",
        borderRadius: 8,
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderWidth: 1, borderColor: "#ffd2a8",
    },
    eventText: { fontSize: 10, color: "#111", fontWeight: "600" },
    eventTime: { color: "#ff9531" },
    calendarHeaderContainer: { backgroundColor: "#f6f6f6ff", borderBottomWidth: 0 },
    calendarHeaderContent: { color: "#000" },
    
    // --- Agenda de hoy
    agendaItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        padding: 10,
        borderWidth: 1, borderColor: "#eef2f7",
        marginBottom: 8,
    },
    agendaIcon: {
        width: 34, height: 34, borderRadius: 10, backgroundColor: "#fff",
        alignItems: "center", justifyContent: "center", marginRight: 10,
        borderWidth: 1, borderColor: "#e5e7eb",
    },
    agendaTitle: { fontWeight: "700", color: "#111", marginBottom: 2 },
    agendaMeta: { color: "#6b7280", fontSize: 12 },
    agendaRight: { marginLeft: 8 },
    badgeLight: {
        fontSize: 12,
        color: "#2563eb",
        backgroundColor: "#e8f0ff",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        overflow: "hidden",
        fontWeight: "700",
    },

    // --- Recordatorios
    reminderItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        borderWidth: 1, borderColor: "#e5e7eb",
        marginBottom: 8,
    },
    reminderLeft: {
        width: 48, height: 48, borderRadius: 12,
        borderWidth: 1, borderColor: "#e5e7eb",
        alignItems: "center", justifyContent: "center",
        marginRight: 10, backgroundColor: "#f9fafb",
    },
    reminderDateNum: { fontWeight: "800", fontSize: 16, color: "#111", lineHeight: 18 },
    reminderDateMon: { textTransform: "uppercase", fontSize: 10, color: "#6b7280" },
    reminderTitle: { fontWeight: "700", color: "#111", marginBottom: 2 },
    reminderMeta: { color: "#6b7280", fontSize: 12 },
    reminderRight: { paddingLeft: 8 },
    reminderAction: { fontSize: 16 },
    badgeUrgent: {
        color: "#fff",
        backgroundColor: "#dc6a6aff",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 6,
        fontSize: 11,
        fontWeight: "800",
        textTransform: "capitalize",
    },

    // --- Tareas
    taskItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        borderWidth: 1, borderColor: "#e5e7eb",
        marginBottom: 8,
    },
    checkbox: {
        width: 22, height: 22, borderRadius: 6,
        borderWidth: 2, borderColor: "#cbd5e1",
        alignItems: "center", justifyContent: "center",
        marginRight: 10, backgroundColor: "#fff",
    },
    checkboxOn: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
    checkboxTick: { color: "#fff", fontWeight: "800" },
    taskText: { flex: 1, color: "#111", fontSize: 13 },
    taskTextDone: { textDecorationLine: "line-through", color: "#6b7280" },
    addTaskBtn: {
        marginTop: 6, alignSelf: "flex-start",
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
        borderWidth: 1, borderColor: "#e5e7eb",
    },
    addTaskText: { color: "#111", fontWeight: "700" },

    // ---- MODAL INTRODUCIR EVENTO EN DICCIONARIO y TAREAS ----
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

    // util
    emptyText: { color: "#6b7280", fontSize: 12 },
    cardShadow: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },


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