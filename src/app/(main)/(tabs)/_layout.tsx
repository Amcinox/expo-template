"use client"

import type React from "react"
import { Tabs } from "expo-router"
import { useTranslation } from "react-i18next"
import { useSettings } from "@/contexts/SettingsContext"
import { VStack } from "@/components/ui/vstack"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"
import { AntDesign } from "@expo/vector-icons"
import { useCustomerStore } from "@/stores/customerStore"
import CustomTabBar from "@/layouts/custom-tab-bar"
import Intercom from "@intercom/intercom-react-native"
import CopilotCustomProvider from "@/components/copilot/CopilotCustomProvider"


function TabBarIcon(props: {
  name: React.ComponentProps<typeof AntDesign>["name"]
  color: string
}) {
  return <AntDesign size={24} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const { t } = useTranslation()
  const { theme } = useSettings()
  const { customer } = useCustomerStore()


  return (
    <CopilotCustomProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          headerShown: true,
          headerStyle: {
            height: 120,
            backgroundColor: theme.background,
          },
          headerTintColor: "#FFF",
          title: ""
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
        initialRouteName="home"
      >
        <Tabs.Screen
          name="data"
          options={{
            title: t("Data"),
            tabBarIcon: ({ color }) => <TabBarIcon name="barschart" color={color} />,
            headerShown: false,
            headerStyle: {
              //  hide bottom border
              elevation: 0,
              shadowOpacity: 0,
              backgroundColor: theme.background,
            }
          }}
        />
        <Tabs.Screen
          name="ressources"
          options={{
            title: t("Ressources"),
            tabBarIcon: ({ color }) => <TabBarIcon name="copy1" color={color} />,
          }}
        />
        <Tabs.Screen
          options={{
            title: t("Home"),
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
            headerLeft: () => (
              <VStack className="p-4" testID="home-tab">
                <Heading className="text-white">Hello, {customer?.firstName}</Heading>
                <Text className="text-white">Welcome to Remirage</Text>
              </VStack>
            ),
            headerTitle: "",
          }}
          name="home"
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("Profile"),
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            title: t("Support"),
            tabBarIcon: ({ color }) => <TabBarIcon name="customerservice" color={color} />,
          }}
          listeners={{
            tabPress: async (e) => {
              e.preventDefault();
              await Intercom.present();
            },
          }}
        />
      </Tabs>
    </CopilotCustomProvider>
  )
}