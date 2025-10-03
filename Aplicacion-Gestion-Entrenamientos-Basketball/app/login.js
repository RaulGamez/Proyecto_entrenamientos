import { View, Text, TextInput, Pressable, KeyboardAvoidingView } from "react-native";
import { styles } from "../components/styles";
import { Link } from "expo-router";

export default function Login() {
    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <TextInput
            placeholder="Teléfono, usuario o correo electrónico"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            />

            <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            />

            <Pressable style={({ pressed }) => [
            styles.lightButton,
            { width: 250, marginBottom: 20 },
            pressed && { backgroundColor: "#8a4200" }
            ]}>
                <Text style={styles.lightText}>Iniciar sesión</Text>
            </Pressable>

            <Text style={styles.lightText}>¿No tienes una cuenta?</Text>
            <Link href="/signUp" style={styles.link} asChild>
                <Pressable >
                    {({ pressed }) => (
                        <Text
                        style={[
                            styles.link,
                            pressed && { color: "#c96c00" }
                        ]}>
                            Regístrate
                        </Text>
                    )}
                </Pressable>
            </Link>

        </KeyboardAvoidingView>
    );
}