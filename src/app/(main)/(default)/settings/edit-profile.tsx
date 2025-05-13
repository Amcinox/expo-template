import { ScrollView } from "react-native";
import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { useSettings } from "@/contexts/SettingsContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { Button, ButtonText } from "@/components/ui/button";
import { useCustomToast } from "@/components/CustomToast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormProvider from "@/components/hook-form/form-provider";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import { useTranslation } from "react-i18next";

const EditProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

type EditProfilePayload = z.infer<typeof EditProfileSchema>;

export default function EditProfileScreen() {
    const { theme } = useSettings();
    const { user } = useUser();
    const { showToast } = useCustomToast();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<EditProfilePayload>({
        resolver: zodResolver(EditProfileSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
        },
    });

    const { handleSubmit } = form;

    const handleUpdateProfile = handleSubmit(async (data: EditProfilePayload) => {
        try {
            setIsLoading(true);
            await user?.update({
                firstName: data.firstName,
                lastName: data.lastName,
            });

            showToast({
                type: "success",
                title: t('Profile Updated'),
                message: t('Your profile has been updated successfully')
            });
        } catch (error: any) {
            showToast({
                type: "error",
                title: t('Update Failed'),
                message: error.message || t('Failed to update profile')
            });
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <VStack space="2xl" className="p-4">
                    <Heading size="xl">{t('Edit Profile')}</Heading>
                    <Text className="text-typography-400">
                        {t('Update your personal information')}
                    </Text>

                    <FormProvider methods={form}>
                        <VStack space="md">
                            <RHFTextField
                                name="firstName"
                                label={t('First Name')}
                                placeholder={t('Enter your first name')}
                                size="xl"
                                className="rounded-lg"
                            />

                            <RHFTextField
                                name="lastName"
                                label={t('Last Name')}
                                placeholder={t('Enter your last name')}
                                size="xl"
                                className="rounded-lg"
                            />

                            <VStack space="xs" className="mt-4">
                                <Text className="text-typography-800 font-medium">
                                    {t('Email')}
                                </Text>
                                <Text className="text-typography-400">
                                    {user?.primaryEmailAddress?.emailAddress}
                                </Text>
                                <Text className="text-typography-400 text-sm">
                                    {t('Email address cannot be changed')}
                                </Text>
                            </VStack>
                        </VStack>
                    </FormProvider>

                    <Button
                        onPress={handleUpdateProfile}
                        disabled={isLoading}
                        className="mt-4"
                    >
                        <ButtonText>
                            {isLoading ? t('Updating...') : t('Update Profile')}
                        </ButtonText>
                    </Button>
                </VStack>
            </ScrollView>
        </SafeAreaView>
    );
} 