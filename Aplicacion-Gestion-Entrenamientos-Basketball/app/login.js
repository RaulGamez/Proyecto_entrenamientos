import { View, Text, TextInput, Pressable, KeyboardAvoidingView } from "react-native";
import { styles } from "../components/styles";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        setLoading(true);

        let emailToUse = email; // lo que el usuario escribe

        // Detectamos el tipo de entrada
        if (!email.includes("@")) {
            // si no hay arroba es username
            const { data, error: userError } = await supabase
                .from("users")
                .select("email")
                .eq("username", emailToUse)
                .maybeSingle();

            if (userError) throw userError;
            if (!data) {
                setError("Usuario no encontrado");
                setLoading(false);
                return;
            }

            emailToUse = data.email; // sustituimos por el correo real
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
        setLoading(false);

        if (error) {
            if (error.message.includes("missing email or phone")) {
                setError("El usuario no existe o la contraseña es incorrecta.");
            }
            else {
                setError(error.message);
            }
            return;
        }

        router.replace("/");
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <Text style={styles.title}>Inicia sesión</Text>

            {error ? <Text style={[styles.error, {width: 250}]}>{error}</Text> : null}
            {
                false // --> true para mostrar
                && <Text style={[styles.error, {width: 250}]}>Hola esto es un texto de error de prueba y necesito hacerlo largo.</Text>
            }

            <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            />

            <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            />

            <Pressable onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
            styles.lightButton,
            { width: 250, marginBottom: 20 },
            (pressed || loading) && { backgroundColor: "#8a4200" }
            ]}>
                <Text style={styles.lightText}>
                    {loading ? "Cargando..." : "Iniciar sesión"}
                </Text>
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