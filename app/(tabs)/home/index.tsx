import { View, Text } from "react-native";
import React from "react";
import { Button } from "@/components/ui/button";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import FormProvider from "@/components/hook-form/form-provider";
import { useForm } from "react-hook-form";
import { Divider } from "@/components/ui/divider";
import RHFCheckbox from "@/components/hook-form/rhf-checkbox";
import { zodResolver } from "@hookform/resolvers/zod"
import { VStack } from "@/components/ui/vstack";
import RHFRadioGroup from "@/components/hook-form/rhf-radio-group";
import RHFSelect from "@/components/hook-form/rhf-select";
import RHFSlider from "@/components/hook-form/rhf-slider";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import { Heading } from "@/components/ui/heading";
import { exampleFormSchema, ExamplePayload } from "@/schemas/example/example.schema";



export default function HomeScreen() {
    const form = useForm<ExamplePayload>({
        resolver: zodResolver(exampleFormSchema),
        defaultValues: {
            name: "",
            terms: true,
            language: "en",
            country: "US",
            motivation: 50,
            notification: true
        },
    })

    const { watch } = form

    return (
        <View className="flex-1 items-center justify-center bg-gray-100 gap-2">
            <Heading>Example Screen</Heading>
            <VStack>
                <Text>Name: {watch("name")}</Text>
                <Text>Langauge: {watch("language")}</Text>
                <Text>Terms: {JSON.stringify(watch("terms"))}</Text>
                <Text>Country: {watch("country")}</Text>
                <Text>Motivation: {watch("motivation")}</Text>
                <Text>Notification: {JSON.stringify(watch("notification"))}</Text>
            </VStack>
            <Divider />
            <FormProvider methods={form}>
                <VStack space="lg">
                    <RHFTextField
                        className="w-1/2"
                        name="name"
                        label="Name"
                        helperText="This is an example"
                    />
                    <RHFCheckbox
                        name="terms"
                        label="I agree to the terms and conditions"
                        checkboxLabel="I agree"
                    />

                    <RHFRadioGroup
                        label="Languages"
                        name="language"
                        options={[{
                            value: "en",
                            label: "English"
                        }, {
                            value: "es",
                            label: "Spanish"
                        }]}
                    />
                    <RHFSelect
                        label="Country"
                        name="country"
                        options={[{
                            value: "MA",
                            label: "Morocco"
                        },
                        {
                            value: "JP",
                            label: "Japan"
                        },
                        {
                            value: "US",
                            label: "United States"
                        }
                        ]}
                    />
                    <RHFSlider

                        size="lg"
                        orientation="horizontal"
                        name="motivation"
                        label="Motivation"
                    />
                    <RHFSwitch
                        name="notification"
                        label="Enable Notification"
                    />
                </VStack>
                <Button variant="outline" className="bg-red-200" onPress={form.handleSubmit((data) => console.log(data))}>
                    <Text>Submit</Text>
                </Button>
            </FormProvider>
            <Divider />
        </View>
    );
}
