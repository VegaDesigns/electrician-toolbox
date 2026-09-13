import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, useAppTheme } from "../src/theme";

export default function RootLayout() {
  return <ThemeProvider><ThemedNavigation /></ThemeProvider>;
}

function ThemedNavigation() {
  const { theme: { colors: Colors, mode } } = useAppTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, gestureEnabled: false, fullScreenGestureEnabled: false, contentStyle: { backgroundColor: Colors.bg } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="settings" options={{ presentation: "modal" }} />
          <Stack.Screen name="workpad" />
          <Stack.Screen name="bending" />
          <Stack.Screen name="panel-colors" />
          <Stack.Screen name="conduit-fill" />
          <Stack.Screen name="box-fill" />
          <Stack.Screen name="wire-guide" />
          <Stack.Screen name="trade-talk" />
          <Stack.Screen name="job-board" />
        </Stack>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
