import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Colors } from "../src/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, gestureEnabled: false, fullScreenGestureEnabled: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="workpad" />
          <Stack.Screen name="bending" />
          <Stack.Screen name="panel-colors" />
          <Stack.Screen name="conduit-fill" />
          <Stack.Screen name="box-fill" />
          <Stack.Screen name="wire-guide" />
          <Stack.Screen name="trade-talk" />
          <Stack.Screen name="job-board" />
        </Stack>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
