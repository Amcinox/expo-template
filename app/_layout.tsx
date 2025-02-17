import "@/global.css";
import "@/locales/i18n";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/auth/AuthContext';
import { SettingsProvider } from '@/contexts/settingsContext';
import RootLayout from '@/layouts/root-layout';


export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function SettingsLayout() {
  return (
    <SettingsProvider>
      <RootLayout>
        <App />
      </RootLayout>
    </SettingsProvider>
  );
}




function App() {
  const colorScheme = useColorScheme();
  const { isInitialized } = useAuth();
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
    </ThemeProvider>
  );
}