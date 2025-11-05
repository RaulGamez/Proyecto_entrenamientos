// components/ProgressBar.jsx
import { View, Text } from "react-native";

export function ProgressBar({ label, value }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 13, color: "#374151" }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
          {Math.round(value)}%
        </Text>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "#e5e7eb",
          marginTop: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.min(value, 100)}%`,
            backgroundColor: "#0f172a",
            height: "100%",
          }}
        />
      </View>
    </View>
  );
}
