import React, { useCallback, useEffect } from 'react';
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
import { useAuth } from '@/auth/AuthContext';
import { Languages, useSettings } from '@/contexts/settingsContext';
import { useTranslation } from 'react-i18next';
import { RadioGroup, Radio, RadioIndicator, RadioLabel, RadioIcon } from "@/components/ui/radio"
import { ScrollView } from 'react-native';
import _ from 'lodash';
import { CircleIcon } from '@/components/ui/icon';



const SettingsScreen = () => {
    const { logout, isBiometricEnabled, enableBiometric, disableBiometric, isLoading, user } = useAuth();
    const toast = useToast();
    const { updateLanguage, language, updatePermission, device, networkState, permissions } = useSettings();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        updatePermission("camera", true);
    }, [updatePermission]);

    const languageHandler = (language: Languages) => {
        i18n.changeLanguage(language);
        updateLanguage(language);
    };

    const handleBiometricToggle = useCallback(async (value: boolean) => {
        if (value) {
            try {
                await enableBiometric();
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
        <ScrollView className="bg-gray-50">
            <Center className="p-4">
                <Box className="w-full max-w-md">
                    <VStack className="space-y-6" space="lg">
                        <Box className="bg-white rounded-xl p-4 shadow-sm">
                            <Heading size="xl" className="text-gray-800">
                                {t('Settings')}
                            </Heading>
                        </Box>

                        <Box className="bg-white rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className="text-gray-700 mb-4">
                                {t('Language')}
                            </Heading>

                            <RadioGroup value={language} onChange={(value) => languageHandler(value)}>
                                {Object.keys(Languages).map((key) => (
                                    <Radio
                                        key={key}
                                        value={Languages[key as keyof typeof Languages]}
                                        size="md"
                                        isInvalid={false}
                                        isDisabled={false}
                                    >
                                        <RadioIndicator>
                                            <RadioIcon as={CircleIcon} />
                                        </RadioIndicator>
                                        <RadioLabel>{Languages[key as keyof typeof Languages]}</RadioLabel>
                                    </Radio>
                                ))}
                            </RadioGroup>
                        </Box>
                        <Box className="bg-white rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className="text-gray-700 mb-4">
                                {t('Security')}
                            </Heading>
                            <VStack className="space-y-4" space="lg">
                                <HStack className="justify-between items-center">
                                    <Text className="text-gray-700">{t('Biometric Login')}</Text>
                                    <Switch
                                        isDisabled={isLoading}
                                        value={isBiometricEnabled}
                                        onValueChange={handleBiometricToggle}
                                    />
                                </HStack>
                                <Button
                                    variant="link"
                                    onPress={() => router.push("/settings/change-password")}
                                    className="bg-blue-500 rounded-lg py-2.5"
                                >
                                    <ButtonText className="text-white">
                                        {t('Change Password')}
                                    </ButtonText>
                                </Button>
                                <Button
                                    variant="link"
                                    onPress={() => router.push("/settings/biometric")}
                                    className="bg-blue-500 rounded-lg py-2.5"
                                >
                                    <ButtonText className="text-white">
                                        {t('Biometric Settings')}
                                    </ButtonText>
                                </Button>
                            </VStack>
                        </Box>

                        <Box className="bg-white rounded-xl p-4 shadow-sm">
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



                        <Box className="bg-white rounded-xl p-4 shadow-sm">
                            <Heading size="sm" className="text-gray-700 mb-4">
                                {t('Device')}
                            </Heading>
                            <VStack className="space-y-3" space="sm">

                                {device && Object.keys(device).map((key) => (
                                    <HStack key={key} className="justify-between items-center">
                                        <Text className="text-gray-700">{_.startCase(key)}</Text>
                                        <Text className="text-gray-700">
                                            {typeof device[key as keyof typeof device] === 'boolean' ? device[key as keyof typeof device] ? 'Yes' : 'No' : device[key as keyof typeof device]}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>


                        <Box className="bg-white rounded-xl p-4 shadow-sm">
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
                        <Box className="bg-white rounded-xl p-4 shadow-sm">
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




                        <Box className="bg-white rounded-xl p-4 shadow-sm">
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