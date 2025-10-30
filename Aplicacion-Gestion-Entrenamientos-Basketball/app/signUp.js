import { View, Text, TextInput, KeyboardAvoidingView, Pressable, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { styles } from "../components/styles";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { validateUsername, validateEmail, validatePhone, validatePassword } from "../lib/validators";

export default function SignUp() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formatErrors, setFormatErrors] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
    });

    const handleSignUp = async () => {
        setError("");

        const errors = {
            username: validateUsername(username),
            email: validateEmail(email),
            phone: validatePhone(phone),
            password: validatePassword(password),
        };

        setFormatErrors(errors);

        const hasErrors = Object.values(errors).some((e) => e !== "");
        if (hasErrors) return;

        try {
            setLoading(true);

            // Validación de variables necesarias (evita 401 por JWT inválido)
            if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
                throw new Error("Falta EXPO_PUBLIC_SUPABASE_URL");
            }
            if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
                throw new Error("Falta EXPO_PUBLIC_SUPABASE_ANON_KEY");
            }
            if (!process.env.EXPO_PUBLIC_REGISTER_SECRET) {
                throw new Error("Falta EXPO_PUBLIC_REGISTER_SECRET");
            }

            const resp = await fetch(
                `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/register-user`,
                {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`, // JWT válido
                    "x-register-secret": process.env.EXPO_PUBLIC_REGISTER_SECRET,          // tu secreto
                },
                body: JSON.stringify({ email, password, username, phone }),
                }
            );

            // Leer como texto SIEMPRE y luego intentar parsear JSON
            const raw = await resp.text();
            let data = null;
            try { data = raw ? JSON.parse(raw) : null; } catch (_) {}

            if (!resp.ok) {
                // Mensaje de error claro, usando JSON si existe o el texto crudo
                const msg = (data && (data.error || data.message)) || raw || `Error ${resp.status}`;
                setError(msg.trim());
                return;
            }

            Alert.alert("Cuenta creada", "Revisa tu correo para confirmar la cuenta");
            router.replace("/login");
            } catch (err) {
                console.error("SignUp error:", err);
                setError(err?.message || "Error inesperado al registrar el usuario");
            } finally {
                setLoading(false);
            }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <Text style={styles.title}>Crea una nueva cuenta</Text>

            {error ? <Text style={[styles.error, {width: 250}]}>{error}</Text> : null}
            {
                false // --> true para mostrar
                && <Text style={[styles.error, {width: 250}]}>Hola esto es un texto de error de prueba y necesito hacerlo largo.</Text>
            }

            <TextInput
            placeholder="Usuario"
            placeholderTextColor="#999"
            style={styles.input}
            value={username}
            onChangeText={(text) => {
                setUsername(text);
                const errorMsg = validateUsername(text);
                setFormatErrors((prev) => ({ ...prev, username: errorMsg || ""}));
            }}
            autoCapitalize="none"
            autoCorrect={false}
            />
            {formatErrors.username ? <Text style={[styles.error, {width: 250}]}>{formatErrors.username}</Text> : null}

            <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
                setEmail(text);
                const errorMsg = validateEmail(text);
                setFormatErrors((prev) => ({ ...prev, email: errorMsg || ""}));
            }}
            autoCapitalize="none"
            autoCorrect={false}
            />
            {formatErrors.email ? <Text style={[styles.error, {width: 250}]}>{formatErrors.email}</Text> : null}

            <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            style={styles.input}
            value={password}
            onChangeText={(text) => {
                setPassword(text);
                const errorMsg = validatePassword(text);
                setFormatErrors((prev) => ({ ...prev, password: errorMsg || ""}));
            }}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            />
            {formatErrors.password ? <Text style={[styles.error, {width: 250}]}>{formatErrors.password}</Text> : null}

            <Pressable
            onPress={handleSignUp}
            disabled={loading}
            style={({ pressed }) => [
            styles.lightButton,
            { width: 250, marginBottom: 20 },
            (pressed || loading) && { backgroundColor: "#8a4200" }
            ]}>
                <Text style={styles.lightText}>
                    {loading ? "Cargando..." : "Crear cuenta"}
                </Text>
            </Pressable>

            <Text style={styles.lightText}>¿Ya tienes una cuenta?</Text>
            <Link href="/login" style={styles.link} asChild>
                <Pressable >
                    {({ pressed }) => (
                        <Text
                        style={[
                            styles.link,
                            pressed && { color: "#c96c00" }
                        ]}>
                            Inicia sesión
                        </Text>
                    )}
                </Pressable>
            </Link>

        </KeyboardAvoidingView>
    );
}