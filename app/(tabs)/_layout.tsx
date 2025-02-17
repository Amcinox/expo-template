import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs, } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useClientOnlyValue } from '@/hooks/useClientOnlyValue';
import { useAuth } from '@/auth/AuthContext';
import { useTranslation } from 'react-i18next';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}

      initialRouteName="settings"
    >

      <Tabs.Screen name="tracking"
        options={{
          title: t('Tracking'),
          tabBarIcon: ({ color }) => <TabBarIcon name="map-marker" color={color} />,
        }}

      />
      <Tabs.Screen name="wellbeing"
        options={{
          title: t('Ressources'),
          tabBarIcon: ({ color }) => <TabBarIcon name="heartbeat" color={color} />,
        }}
      />
      <Tabs.Screen


        options={{
          title: t('Home'),
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
        name="home"
      />
      <Tabs.Screen name="settings"
        options={{
          title: t('Settings'),
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />



    </Tabs>
  )

}
