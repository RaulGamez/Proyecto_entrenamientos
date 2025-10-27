import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Obtener sesion actual
		const initUser = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			setUser(user ?? null);
			setLoading(false);
		};
		initUser();

		// Escuchar cambios en la sesion
		const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

	return (
		<UserContext.Provider value={{ user, loading }}>
			{children}
		</UserContext.Provider>
	);
};

// Hook de conveniencia
export const useUser = () => useContext(UserContext);
