import "../../global.css";
import "@/locales/i18n";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import _ from "lodash";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import useAllTrue from "@/hooks/useAllTrue";


export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,

});


export default function SettingsLayout() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <GluestackUIProvider mode="light">
          <AuthProvider>
            <App />
          </AuthProvider>
        </GluestackUIProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}




function App() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const colorScheme = useColorScheme();
  const { isInitialized } = useAuth();
  const { settingsInitilized } = useSettings()

  const isComplete = useAllTrue(settingsInitilized, isInitialized, loaded);
  useEffect(() => {
    if (error) throw error;
  }, [error]);
  useEffect(() => {
    if (isComplete) {
      SplashScreen.hideAsync();
    }
  }, [isComplete]);

  if (!isComplete) {
    return null;
  }


  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{
          headerShown: false,
        }}>
          <Stack.Screen name="(main)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="webview" />
          <Stack.Screen
            name="debugModal"
            options={{
              presentation: 'formSheet',
            }}
          />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}