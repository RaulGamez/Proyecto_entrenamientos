import { useEffect, useSatate } from "react";

import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

export function Main() {
	return (
		<View style={styles.container}>
			<ScrollView>
				<Text style={styles.title}>INICIO SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>MAIN CON SCROLL</Text>
				<Text style={styles.title}>FINAL SCROLL</Text>
			</ScrollView>
		</View>
	);
}