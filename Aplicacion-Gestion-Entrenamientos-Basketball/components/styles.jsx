import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        backgroundColor: "#000"
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#fff",
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
    }
});