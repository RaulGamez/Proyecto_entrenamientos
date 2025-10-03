import { View, Text, TextInput, KeyboardAvoidingView, Pressable } from "react-native";
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

        const hasErrors = Object.values(formatErrors).some((e) => e !== "");
        if (hasErrors) return;

        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({ email, password });
            setLoading(false);

            alert("Revisa tu correo para confirmar la cuenta");
            router.replace("/login");
        }
        catch {
            setError(error.message);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <Text style={styles.title}>Crea una nueva cuenta</Text>

            {error ? <Text style={[styles.error, {width: 250}]}>{error}</Text> : null}
            {
                false // true para mostrar
                && <Text style={[styles.error, {width: 250}]}>Hola esto es un texto de error de prueba y necesito hacerlo largo.</Text>
            }

            <TextInput
            placeholder="Usuario"
            placeholderTextColor="#999"
            style={styles.input}
            value={username}
            onChangeText={(text) => {
                const errorMsg = validateUsername(text);
                if (errorMsg) {
                    setFormatErrors((prev) => ({ ...prev, username: errorMsg }));
                } else {
                    setFormatErrors((prev) => ({ ...prev, username: "" }));
                }
                setUsername(text);
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
                if (errorMsg) {
                    setFormatErrors((prev) => ({ ...prev, email: errorMsg }));
                } else {
                    setFormatErrors((prev) => ({ ...prev, email: "" }));
                }
            }}
            autoCapitalize="none"
            autoCorrect={false}
            />
            {formatErrors.email ? <Text style={[styles.error, {width: 250}]}>{formatErrors.email}</Text> : null}

            <TextInput
            placeholder="Teléfono"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
                const errorMsg = validatePhone(text);
                if (errorMsg) {
                    setFormatErrors((prev) => ({ ...prev, phone: errorMsg }));
                } else {
                    setFormatErrors((prev) => ({ ...prev, phone: "" }));
                }
                setPhone(text);
            }}
            />
            {formatErrors.phone ? <Text style={[styles.error, {width: 250}]}>{formatErrors.phone}</Text> : null}

            <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            style={styles.input}
            value={password}
            onChangeText={(text) => {
                setPassword(text);
                const errorMsg = validatePassword(text);
                if (errorMsg) {
                    setFormatErrors((prev) => ({ ...prev, password: errorMsg }));
                } else {
                    setFormatErrors((prev) => ({ ...prev, password: "" }));
                }
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
                    {loading ? "Cargando..." : "Siguiente"}
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