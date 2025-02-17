import { ScrollView, View } from "react-native";
import React from "react";
import { Button, ButtonText } from "@/components/ui/button";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import FormProvider from "@/components/hook-form/form-provider";
import { useForm } from "react-hook-form";
import { Divider } from "@/components/ui/divider";
import RHFCheckbox from "@/components/hook-form/rhf-checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import RHFRadioGroup from "@/components/hook-form/rhf-radio-group";
import RHFSelect from "@/components/hook-form/rhf-select";
import RHFSlider from "@/components/hook-form/rhf-slider";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { exampleFormSchema, ExamplePayload } from "@/schemas/example/example.schema";
import RHFTextarea from "@/components/hook-form/rhf-textarea";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
    const { t } = useTranslation();
    const form = useForm<ExamplePayload>({
        resolver: zodResolver(exampleFormSchema),
        defaultValues: {
            name: "",
            terms: true,
            language: "en",
            country: "US",
            motivation: 50,
            notification: true,
            bio: ""
        },
    });

    const { watch } = form;

    return (
        <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}>
            <Box className="flex-1 bg-gray-50 px-2">
                <Card className="mb-4 p-4 bg-white rounded-lg shadow-md">
                    <VStack className="space-y-6">
                        {/* Header */}
                        <Center className="mb-4">
                            <Heading size="xl" className="text-gray-800">{t("Example Screen")}</Heading>
                            <Text className="text-sm text-gray-500 mt-1">{t("Complete information")}</Text>
                        </Center>

                        <FormProvider methods={form}>
                            <VStack className="space-y-6">
                                <Box>
                                    <Heading size="md" className="text-gray-700 mb-3">{t("Personal Details")}</Heading>
                                    <VStack className="space-y-4">
                                        <RHFTextField
                                            name="name"
                                            label={t("Full Name")}
                                            helperText={t("Enter your full name")}
                                            className="w-full"
                                        />

                                        <RHFSelect
                                            label={t("Country")}
                                            name="country"
                                            options={[
                                                { value: "MA", label: "Morocco" },
                                                { value: "JP", label: "Japan" },
                                                { value: "US", label: "United States" }
                                            ]}
                                        />
                                        <RHFTextarea

                                            size="sm"
                                            name="bio"
                                            label={t("Bio")}
                                            placeholder="Tell us about yourself" />
                                    </VStack>
                                </Box>

                                <Divider className="my-4" />

                                <Box>
                                    <Heading size="md" className="text-gray-700 mb-3">{t("Preferences")}</Heading>
                                    <VStack className="space-y-4">
                                        <RHFRadioGroup
                                            label={t("Preferred Language")}
                                            name="language"
                                            options={[
                                                { value: "en", label: "English" },
                                                { value: "es", label: "Spanish" }
                                            ]}
                                        />

                                        <RHFSlider
                                            size="lg"
                                            orientation="horizontal"
                                            name="motivation"
                                            label={t("Motivation Level")}
                                            className="my-2"
                                        />

                                        <RHFSwitch
                                            name="notification"
                                            label={t("Enable Notifications")}
                                        />
                                    </VStack>
                                </Box>

                                <Divider className="my-4" />


                                <Box className="bg-gray-50 p-4 rounded-lg">
                                    <RHFCheckbox
                                        name="terms"
                                        label={t("Terms and Conditions")}
                                        checkboxLabel={t("I agree to the terms and conditions")}
                                    />
                                </Box>


                                <HStack space="md" className="justify-end">
                                    <Button
                                        variant="outline"
                                        onPress={() => form.reset()}
                                    >
                                        <ButtonText>{t("Reset")}</ButtonText>
                                    </Button>
                                    <Button
                                        variant="solid"
                                        className="bg-blue-500 "
                                        onPress={form.handleSubmit((data) => console.log(data))}
                                    >
                                        <ButtonText className="text-white">{t("Save")}</ButtonText>
                                    </Button>
                                </HStack>
                            </VStack>
                        </FormProvider>
                    </VStack>
                </Card>

                <Card className="p-4 bg-white rounded-lg shadow-md">
                    <VStack className="space-y-2">
                        <Heading size="sm" className="text-gray-700">{t("Current Values")}</Heading>
                        <Text>{t("Name")}: {watch("name")}</Text>
                        <Text>{t("Language")}: {watch("language")}</Text>
                        <Text>{t("Terms")}: {JSON.stringify(watch("terms"))}</Text>
                        <Text>{t("Country")}: {watch("country")}</Text>
                        <Text>{t("Motivation")}: {watch("motivation")}</Text>
                        <Text>{t("Notifications")}: {JSON.stringify(watch("notification"))}</Text>
                    </VStack>
                </Card>
            </Box>
        </ScrollView>
    );
}