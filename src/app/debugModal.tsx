import React from "react";
import { useState } from "react";
import { ScrollView } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import FormProvider from "@/components/hook-form/form-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useLocalSearchParams, useRouter, usePathname, Href } from "expo-router";
import { useSettings } from "@/contexts/SettingsContext";
import RHFTextarea from "@/components/hook-form/rhf-textarea";
import { Center } from "@/components/ui/center";
import { defaultThemes } from "@/constants/Colors";
import { Pressable } from "@/components/ui/pressable";

const themeSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  tertiary: z.string(),
  success: z.string(),
  warning: z.string(),
  error: z.string(),
  info: z.string(),
  typography: z.string(),
  caption: z.string(),
  background: z.string(),
  outline: z.string(),
  indicatorPrimary: z.string(),
  indicatorInfo: z.string(),
  indicatorError: z.string(),
  backgroundError: z.string(),
  backgroundWarning: z.string(),
  backgroundSuccess: z.string(),
  backgroundMuted: z.string(),
  backgroundInfo: z.string(),
});

type ThemeFormData = z.infer<typeof themeSchema>;
type TabType = "storage" | "theme" | "navigation";

export default function DebugModal() {

  const [activeTab, setActiveTab] = useState<TabType>("storage");
  const [asyncStorageKeys, setAsyncStorageKeys] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { updateTheme, theme } = useSettings();

  const storageForm = useForm({
    defaultValues: {
      selectedKey: "",
      selectedKeyValue: "",
    },
  });

  const navigationForm = useForm({
    defaultValues: {
      navigationInput: "",
    },
  });

  const themeForm = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: theme,
  });

  const handleClearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      setAsyncStorageKeys([]);
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const handleGetAllKeys = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      setAsyncStorageKeys(keys as any);
    } catch (error) {
      console.error("Error getting AsyncStorage keys:", error);
    }
  };

  const handleGetKeyData = async () => {
    const selectedKey = storageForm.getValues("selectedKey");
    if (selectedKey) {
      try {
        const value = await AsyncStorage.getItem(selectedKey);
        storageForm.setValue("selectedKeyValue", value || "No value found");
      } catch (error) {
        console.error("Error getting key data:", error);
      }
    }
  };

  const handleDeleteKey = async () => {
    const selectedKey = storageForm.getValues("selectedKey");
    if (selectedKey) {
      try {
        await AsyncStorage.removeItem(selectedKey);
        handleGetAllKeys();
        storageForm.reset();
      } catch (error) {
        console.error("Error deleting key:", error);
      }
    }
  };

  const handleNavigate = (data: { navigationInput: any }) => {
    if (data.navigationInput) {
      router.push(data.navigationInput);
    }
  };

  const handleThemeUpdate = (data: ThemeFormData) => {
    updateTheme(data);
  };

  const handleResetTheme = () => {
    themeForm.reset(defaultThemes[0].colors);
    updateTheme(defaultThemes[0].colors);
  };


  const handleKeySelect = (key: string) => {

    storageForm.setValue("selectedKey", key);
    handleGetKeyData();
  };


  if (!["dev", "stg"].includes(process.env.EXPO_PUBLIC_ENV!)) {
    return null
  }
  const renderTabContent = () => {
    switch (activeTab) {
      case "storage":
        return (
          <FormProvider methods={storageForm}>
            <VStack space="md">
              <HStack space="md" className="justify-between">
                <Button onPress={handleClearAsyncStorage} action="negative">
                  <ButtonText>Clear Storage</ButtonText>
                </Button>
                <Button onPress={handleGetAllKeys}>
                  <ButtonText>Refresh Keys</ButtonText>
                </Button>
              </HStack>

              {asyncStorageKeys.length > 0 && (
                <Card className="p-4">
                  <Text className="font-bold mb-2">Storage Keys</Text>
                  <ScrollView className="max-h-32">
                    <HStack space="sm" className="flex-wrap">
                      {asyncStorageKeys.map((key) => (
                        <Button
                          variant="outline"
                          action="positive"
                          key={key}
                          onPress={() => handleKeySelect(key)}
                        >
                          <ButtonText
                            onPress={() => handleKeySelect(key)}
                            className="text-sm p-2 rounded-md active:bg-gray-100"
                          >
                            {key}
                          </ButtonText>
                        </Button>
                      ))}
                    </HStack>
                  </ScrollView>
                </Card>
              )}

              <RHFTextField
                name="selectedKey"
                label="Key"
                placeholder="Enter storage key"
              />

              <HStack space="md" className="justify-between">
                <Button onPress={handleGetKeyData}>
                  <ButtonText>Get Value</ButtonText>
                </Button>
                <Button onPress={handleDeleteKey} action="negative">
                  <ButtonText>Delete Key</ButtonText>
                </Button>
              </HStack>

              <RHFTextarea
                name="selectedKeyValue"
                label="Value"
                className="h-24"
              />
            </VStack>
          </FormProvider>
        );
      case "theme":
        return (
          <FormProvider methods={themeForm}>
            <VStack space="md">
              <HStack space="md" className="justify-end">
                <Button
                  onPress={handleResetTheme}
                  variant="outline"
                  className="mb-4"
                >
                  <ButtonText>Reset to Default</ButtonText>
                </Button>
              </HStack>

              <ScrollView className="max-h-96">
                <VStack space="md">
                  {Object.keys(theme).map((key) => (
                    <HStack key={key} space="md" className="items-center justify-center ">

                      <Box className="flex-1">
                        <RHFTextField
                          name={key}
                          label={key.charAt(0).toUpperCase() + key.slice(1)}
                        />
                      </Box>
                      <Box
                        className="w-8 h-8 rounded-full border border-gray-200 "
                        style={{
                          backgroundColor: themeForm.getValues(key as keyof ThemeFormData),
                        }}
                      />
                    </HStack>
                  ))}
                </VStack>
              </ScrollView>

              <Button
                onPress={themeForm.handleSubmit(handleThemeUpdate)}
                className="mt-4"
              >
                <ButtonText>Update Theme</ButtonText>
              </Button>
            </VStack>
          </FormProvider>
        );

      case "navigation":
        return (
          <FormProvider methods={navigationForm}>
            <VStack space="md">
              <Card className="p-4">
                <Text className="font-bold mb-2">Current Screen</Text>
                <Text className="text-sm">{pathname}</Text>
              </Card>

              <RHFTextField
                name="navigationInput"
                label="Navigate To"
                placeholder="Enter screen path"
              />

              <Button onPress={navigationForm.handleSubmit(handleNavigate)}>
                <ButtonText>Navigate</ButtonText>
              </Button>
            </VStack>
          </FormProvider>
        );
    }
  };

  return (
    <Box className="bg-white p-6 rounded-lg">
      <VStack space="lg">
        <HStack className="justify-between items-center">
          <Heading size="xl">Developer Settings</Heading>
          <Button
            onPress={() => router.dismiss()}
            variant="link" className="p-2">
            <ButtonText>✕</ButtonText>
          </Button>

        </HStack>

        <Card className="p-4">
          <HStack space="sm" className="justify-center">
            {(['storage', 'theme', 'navigation'] as TabType[]).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "solid" : "outline"}
                onPress={() => setActiveTab(tab)}
                className="flex-1"
              >
                <ButtonText>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </ButtonText>
              </Button>
            ))}
          </HStack>
        </Card>

        <Box className="mt-4">{renderTabContent()}</Box>
      </VStack>
    </Box>
  );
}