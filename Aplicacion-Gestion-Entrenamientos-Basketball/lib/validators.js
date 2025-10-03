export const validateUsername = (username) => {
	return "";
	if (!username.trim()) return "El usuario no puede estar vacío";
	if (!/^[a-zA-Z0-9_]+$/.test(username)) {
		return "El usuario solo puede contener letras, números y guiones bajos";
	}
};

export const validateEmail = (email) => {
	if (!email.trim()) return "El correo no puede estar vacío";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return "Introduce un correo válido";
	}
	return "";
};

export const validatePhone = (phone) => {
	return "";
	if (!phone.trim()) return "El teléfono no puede estar vacío";
	if (!/^\+?[0-9]{7,15}$/.test(phone)) {
		return "Introduce un teléfono válido";
	}
};

export const validatePassword = (password) => {
	if (!password) return "La contraseña no puede estar vacía";
	if (password.length < 8) return "Debe tener al menos 8 caracteres";
	if (!/[A-Z]/.test(password)) return "Debe incluir al menos una mayúscula";
	if (!/[0-9]/.test(password)) return "Debe incluir al menos un número";
	if (!/[^A-Za-z0-9]/.test(password)) return "Debe incluir al menos un símbolo";
	return "";
};