import React, { useCallback } from 'react';
import { router } from 'expo-router';
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack"
import { HStack } from "@/components/ui/hstack"
import { Text } from "@/components/ui/text"
import { Button, ButtonText } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Heading } from "@/components/ui/heading"
import { Center } from "@/components/ui/center"
import { Box } from "@/components/ui/box"
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import { RadioGroup, Radio, RadioIndicator, RadioLabel, RadioIcon } from "@/components/ui/radio"
import { ScrollView } from 'react-native';
import _ from 'lodash';
import { CircleIcon } from '@/components/ui/icon';
import { languagesList } from '@/constants/language';
import { Languages } from '@/types/settings';
import { defaultThemes } from '@/constants/Colors';





const SettingsScreen = () => {
    const toast = useToast();
    const { logout, isBiometricEnabled, enableBiometric, disableBiometric, isLoading } = useAuth();
    const { updateLanguage, updateTheme, theme, language, device, networkState, permissions } = useSettings();
    const { t } = useTranslation();


    const languageHandler = (language: Languages) => {
        updateLanguage(language);
    };

    const handleBiometricToggle = useCallback(async (value: boolean) => {
        if (value) {
            try {
                await enableBiometric("");
            } catch (error) {
                console.error("Error enabling biometric:", error);
                toast.show({});
            }
        } else {
            try {
                await disableBiometric();
            } catch (error) {
                console.error("Error disabling biometric:", error);
                toast.show({});
            }
        }
    }, [disableBiometric, enableBiometric, toast]);

    return (
        <ScrollView className="bg-background-50">
            <Center className="p-4">
                <Box className="w-full max-w-md ">
                    <VStack className="space-y-6" space="lg">
                        <Box className="bg-background-700 rounded-xl p-4 shadow-sm">
                            <Heading size="xl" >
                                {t('Settings')}
                            </Heading>
                        </Box>

                        <Box className="bg-background-700 rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className=" mb-4">
                                {t('Language')}
                            </Heading>

                            <RadioGroup value={language} onChange={(value) => languageHandler(value)}>
                                {languagesList.map((lang) => (
                                    <Radio
                                        key={lang.value}
                                        value={lang.value}
                                        size="md"
                                        isInvalid={false}
                                        isDisabled={false}
                                    >
                                        <RadioIndicator>
                                            <RadioIcon as={CircleIcon} />
                                        </RadioIndicator>
                                        <RadioLabel>{lang.title} {lang.flag}</RadioLabel>
                                    </Radio>
                                ))}
                            </RadioGroup>
                        </Box>

                        {/* Theme */}
                        <Box className="bg-background-700 rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className=" mb-4">
                                {t('Themes')}

                            </Heading>
                            <VStack className="space-y-4" space="lg">
                                {defaultThemes.map((item) => (
                                    <Button

                                        disabled={JSON.stringify(item.colors) === JSON.stringify(theme)}
                                        key={item.title}
                                        variant="solid"
                                        onPress={() => updateTheme(item.colors)}
                                        className="bg-gray-100 rounded-lg py-2.5"
                                    >
                                        <ButtonText className="text-gray-700">
                                            {item.title}
                                        </ButtonText>
                                    </Button>
                                ))}
                            </VStack>
                        </Box>
                        <Box className="bg-background-700 rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className="mb-4">
                                {t('Security')}
                            </Heading>
                            <VStack className="space-y-4" space="lg">
                                <HStack className="justify-between items-center">
                                    <Text >{t('Biometric Login')}</Text>
                                    <Switch
                                        isDisabled={isLoading}
                                        value={isBiometricEnabled}
                                        onValueChange={handleBiometricToggle}
                                    />
                                </HStack>
                                <Button
                                    action="primary"
                                    variant="solid"
                                    onPress={() => router.push("/settings/change-password")}
                                    className="rounded-lg py-2.5"
                                >
                                    <ButtonText className="text-white">
                                        {t('Change Password')}
                                    </ButtonText>
                                </Button>
                                <Button
                                    variant="solid"
                                    onPress={() => router.push("/settings/biometric")}
                                    className="rounded-lg py-2.5"
                                >
                                    <ButtonText className="text-white">
                                        {t('Biometric Settings')}
                                    </ButtonText>
                                </Button>
                            </VStack>
                        </Box>

                        <Box className="bg-background-700 rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className="text-gray-700 mb-4">
                                {t('Profile Information')}
                            </Heading>
                            <VStack className="space-y-3" space="sm">
                                <Button
                                    variant="link"
                                    onPress={() => router.push("/settings/basic-information")}
                                    className="bg-gray-100 rounded-lg py-2.5"
                                >
                                    <ButtonText className="text-gray-700">
                                        {t('Basic Information')}
                                    </ButtonText>
                                </Button>
                                <Button
                                    variant="link"
                                    onPress={() => router.push("/settings/employer-information")}
                                    className="bg-gray-100 rounded-lg py-2.5"
                                >
                                    <ButtonText className="text-gray-700">
                                        {t('Employer Information')}
                                    </ButtonText>
                                </Button>
                                <Button
                                    variant="link"
                                    onPress={() => router.push("/settings/bank-information")}
                                    className="bg-gray-100 rounded-lg py-2.5"
                                >
                                    <ButtonText className="text-gray-700">
                                        {t('Bank Information')}
                                    </ButtonText>
                                </Button>
                            </VStack>
                        </Box>



                        <Box className="bg-background-700 rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className="text-gray-700 mb-4">
                                {t('Device')}
                            </Heading>
                            <VStack className="space-y-3" space="sm">

                                {device && Object.keys(device).map((key) => (
                                    <HStack key={key} className="justify-between items-center">
                                        <Text className="text-gray-700">{_.startCase(key)}</Text>
                                        <Text className="text-gray-700  max-w-32" numberOfLines={1}>
                                            {typeof device[key as keyof typeof device] === 'boolean' ? device[key as keyof typeof device] ? 'Yes' : 'No' : device[key as keyof typeof device]}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>


                        <Box className="bg-background-700 rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className="text-gray-700 mb-4">
                                {t('Network State')}
                            </Heading>
                            <VStack className="space-y-3" space="sm">

                                {networkState && Object.keys(networkState).map((key) => (
                                    <HStack key={key} className="justify-between items-center">
                                        <Text className="text-gray-700">{_.startCase(key)}</Text>
                                        <Text className="text-gray-700">
                                            {typeof networkState[key as keyof typeof device] === 'boolean' ? networkState[key as keyof typeof device] ? 'Yes' : 'No' : networkState[key as keyof typeof device]}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>



                        {/* //permission box */}
                        <Box className="bg-background-700 rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className="text-gray-700 mb-4">
                                {t('Permissions')}
                            </Heading>
                            <VStack className="space-y-3" space="sm">

                                {permissions && Object.keys(permissions).map((key) => (
                                    <HStack key={key} className="justify-between items-center">
                                        <Text className="text-gray-700">{_.startCase(key)}</Text>
                                        <Text className="text-gray-700">
                                            {key === 'biometric' ? (
                                                permissions[key as keyof typeof permissions] ? (
                                                    `Enrolled: ${(permissions[key as keyof typeof permissions] as any)?.isEnrolled ? 'Yes' : 'No'}, Hardware: ${(permissions[key as keyof typeof permissions] as any)?.hasHardware ? 'Yes' : 'No'}`
                                                ) : 'Not Available'
                                            ) : typeof permissions[key as keyof typeof permissions] === 'boolean' ? (
                                                permissions[key as keyof typeof permissions] ? 'Yes' : 'No'
                                            ) : (
                                                String(permissions[key as keyof typeof permissions])
                                            )}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>




                        <Box className="bg-background-700 rounded-xl p-4 shadow-sm">
                            <Button
                                variant="solid"
                                onPress={async () => await logout()}
                                className="bg-red-500 rounded-lg py-2.5 w-full"
                            >
                                <ButtonText className="text-white font-medium">
                                    {t('Logout')}
                                </ButtonText>
                            </Button>
                        </Box>
                    </VStack>
                </Box>
            </Center>
        </ScrollView>
    );
};

export default SettingsScreen;