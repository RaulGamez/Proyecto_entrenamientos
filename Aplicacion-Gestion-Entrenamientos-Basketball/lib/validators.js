import { parsePhoneNumberFromString } from "libphonenumber-js";

export const validateUsername = (username) => {
	if (!username.trim()) return "El usuario no puede estar vacío";
	if (!/^[a-zA-Z0-9_]+$/.test(username)) {
		return "El usuario solo puede contener letras, números y guiones bajos";
	}
	return "";
};

export const validateEmail = (email) => {
	if (!email.trim()) return "El correo no puede estar vacío";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return "Introduce un correo válido";
	}
	return "";
};

export const validatePhone = (phone) => {
	if (!phone.trim()) return ""; // opcional
	try {
		const phoneNumber = parsePhoneNumberFromString(phone);
		if (!phoneNumber || !phoneNumber.isValid()) {
			return "Introduce un teléfono válido con prefijo (+34...)";
		}
	}
	catch {
		return "Introduce un teléfono válido con prefijo (+34...)";
	}
	return "";
};

export const validatePassword = (password) => {
	if (!password) return "La contraseña no puede estar vacía";
	if (password.length < 8) return "Debe tener al menos 8 caracteres";
	if (!/[A-Z]/.test(password)) return "Debe incluir al menos una mayúscula";
	if (!/[0-9]/.test(password)) return "Debe incluir al menos un número";
	if (!/[^A-Za-z0-9]/.test(password)) return "Debe incluir al menos un símbolo";
	return "";
};


export const cleanText = (s) => {return s.trim().replace(/\s+/g, " ")};

export const validateText = (value) => {
	if (!value) return true; // permitir vacío (menos name y status si quieres que sean obligatorios)
    const cleaned = cleanText(value);
	
	const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
	
    return textRegex.test(cleaned);
};

export const validateInt2 = (value) => {
	if (value === null || value === "") return true; // vacío permitido
	
    if (!/^\d+$/.test(String(value)))
		return false; // Debe contener solo digitos
	
	const num = Number(value);
	
    return (num >= 0 && num <= 32767); // Rango de int2
};

export const validatePlayerInfo = (pInfo) => {
	const formatErrors = {
		name: "",
		number: "",
		age: "",
		role: "",
		height: "",
		status: ""
	};

	if (!pInfo.name.trim() || !validateText(pInfo.name))
		formatErrors.name = "El nombre solo debe contener letras y espacios";

	if (!validateInt2(pInfo.number))
		formatErrors.number = "El número debe contener un valor válido";

	if (!validateInt2(pInfo.age))
		formatErrors.age = "El año de nacimiento debe contener un valor válido";

	if (!validateText(pInfo.role))
		formatErrors.role = "El rol solo debe contener letras y espacios";

	if (!validateInt2(pInfo.height))
		formatErrors.height = "La altura debe contener un valor válido";

	if (!validateText(pInfo.status))
		formatErrors.status = "El estado solo debe contener letras y espacios";

	return formatErrors;
};