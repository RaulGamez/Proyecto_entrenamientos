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

            const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .maybeSingle();

            if (existingUser) {
                const suggestions = [
                    `${username}_${Math.floor(Math.random() * 100)}`,
                    `${username}${Math.floor(Math.random() * 1000)}`,
                    `${username.slice(0, 8)}_${Math.floor(Math.random() * 9999)}`
                ];
                setFormatErrors((prev) => ({ ...prev, username: `El usuario ya existe. Prueba con: ${suggestions.join(", ")}` }));
                setLoading(false);
                return;
            }

            const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
            if (signUpError) {
                if (signUpError.message.includes("User already registered")) {
                    setFormatErrors((prev) => ({ ...prev, email: "Este correo ya está registrado. Inicia sesión o usa otro correo." }));
                    return;
                }
                else {
                    setError(signUpError.message);
                }
                throw signUpError;
            }

            const user = data.user;
            if (user) {
                const { error: insertError } = await supabase.from("users").insert([{
                        id: user.id,
                        username: username,
                        phone: phone || null, // opcional
                        email: email,
                    },]);

                if (insertError) {
                    setError(insertError.message);
                    throw insertError;
                }
            }

            alert("Revisa tu correo para confirmar la cuenta");
            router.replace("/login");
        }
        catch {
            return;
        }
        finally {
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
                if (errorMsg) {
                    setFormatErrors((prev) => ({ ...prev, username: errorMsg }));
                } else {
                    setFormatErrors((prev) => ({ ...prev, username: "" }));
                }
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
                setPhone(text);
                const errorMsg = validatePhone(text);
                if (errorMsg) {
                    setFormatErrors((prev) => ({ ...prev, phone: errorMsg }));
                } else {
                    setFormatErrors((prev) => ({ ...prev, phone: "" }));
                }
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