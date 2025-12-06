import { StyleSheet } from "react-native";

export const teamStyles = StyleSheet.create({
  // Contenedor específico de la pantalla de equipos
  screen: { flex: 1, backgroundColor: "#f6f7fb" },

  // ---- Header (Plantilla / Estadísticas, chips, etc.)
  pageTabs: { marginTop: 8, alignSelf: "center", color: "#1f2937" },
  tabActive: {
    backgroundColor: "#eef2ff",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
    fontWeight: "600",
  },
  tabInactive: {
    backgroundColor: "#eef2ff",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
    color: "#6b7280",
  },
  tabSpacer: {},

  listHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 16, marginBottom: 8 },
  sectionCount: { color: "#6b7280", fontWeight: "500" },

  headerActions: { flexDirection: "row", gap: 10, marginBottom: 12 },
  chip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chipDark: { backgroundColor: "#0f172a", borderColor: "#0f172a" },
  chipText: { fontWeight: "600", color: "#111827" },
  chipTextDark: { color: "#fff" },

  // ---- Card de equipo
  teamCard: {
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  teamCover: { height: 150, justifyContent: "flex-end" },
  teamCoverImage: { resizeMode: "cover" },
  teamCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  teamTitleWrap: { padding: 12 },
  teamTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  teamTitle2: { color: "#000", fontSize: 14, marginLeft: 12},
  teamSubtitle: { color: "#e5e7eb", marginTop: 2 },

  metricsRow: {
    alignItems: "right",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    color: "#111827",
  },
  cardFoot: { color: "#6b7280", fontSize: 11, paddingHorizontal: 12, paddingVertical: 10 },

  // ---- Formularios del creador
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 4 },
  modalSubtitle: { color: "#6b7280", marginBottom: 8 },
  label: { fontSize: 13, color: "#374151", marginBottom: 6 },
  sectionHeaderText: { fontSize: 14, fontWeight: "700", color: "#111827" },
  sliderRow: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  rangeText: { fontWeight: "700", color: "#111827" },
  darkButton: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  darkText: { color: "#fff", fontWeight: "700" },
  lightButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  lightText: { color: "#111827", fontWeight: "700" },
  errorText: { color: "#b91c1c", marginTop: 4 },

  // en stylesTeams.js
  playerRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    overflow: "hidden",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }

});
