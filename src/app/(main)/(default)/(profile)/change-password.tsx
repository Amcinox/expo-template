import React, { useState } from "react";
import Container from "@/components/Container";
import RHFTextField from "@/components/hook-form/rhf-text-field";
import { ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";
import { InputSlot, InputIcon } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { useForm } from "react-hook-form";
import { ChangePasswordPayload, ChangePasswordSchema, PASSWORD_RULES } from "@/schemas/auth/changePassword.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import FormProvider from "@/components/hook-form/form-provider";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { FontAwesome } from "@expo/vector-icons";
import { FormControlHelperText } from "@/components/ui/form-control";
export default function ChangePasswordScreen() {

    const router = useRouter()
    const { toggleSplashLoading, theme } = useSettings()
    const [showPassword, setShowPassword] = useState(false)
    const { isLoading, changePassword } = useAuth();


    const form = useForm<ChangePasswordPayload>({
        resolver: zodResolver(ChangePasswordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
        },
    });

    const { handleSubmit } = form;



    const togglePasswordVisibility = () => {
        setShowPassword((showState) => !showState);
    }


    const onUpdate = handleSubmit(async (data: ChangePasswordPayload) => {
        try {
            toggleSplashLoading(true)
            await changePassword(data.oldPassword, data.newPassword)
            router.back()
        }
        catch (error) {
            console.log(error)
        }
        finally {
            toggleSplashLoading(false)
        }
    })


    return (
        <Container>
            <VStack className="p-4 flex-1 bg-background-50" space="3xl">
                <VStack className="justify-center items-center pt-10">
                    <FontAwesome name="lock" size={40} color={theme.background} />
                </VStack>

                <VStack space="md" >
                    <FormProvider methods={form}>
                        <RHFTextField
                            name="oldPassword"
                            placeholder="Old Password"
                            type={showPassword ? "text" : "password"}
                            size="xl"
                            className='rounded-md '

                            rightIcon={<InputSlot
                                className="pr-3 text-typography-900" onPress={togglePasswordVisibility}>
                                <InputIcon
                                    className='text-typography-900'
                                    color="gray"
                                    as={showPassword ? EyeIcon : EyeOffIcon} />
                            </InputSlot>}

                        />


                        <RHFTextField
                            name="newPassword"
                            placeholder="New Password"
                            type={showPassword ? "text" : "password"}
                            size="xl"
                            className="rounded-md"
                            rightIcon={
                                <InputSlot
                                    className="pr-3 text-typography-900"
                                    onPress={togglePasswordVisibility}
                                >
                                    <InputIcon
                                        className="text-typography-900"
                                        color="gray"
                                        as={showPassword ? EyeIcon : EyeOffIcon}
                                    />
                                </InputSlot>
                            }
                            helperText={
                                <VStack space="xs" className="p-2">
                                    <FormControlHelperText className="font-semibold">
                                        Password must:
                                    </FormControlHelperText>
                                    {PASSWORD_RULES.map((rule, index) => (
                                        <FormControlHelperText key={index} className='items-center '>
                                            * {rule.description}
                                        </FormControlHelperText>
                                    ))}
                                </VStack>
                            }
                        />
                        <HStack className="justify-between">
                            <Button
                                className=' rounded-3xl h-12 w-full '
                                variant="solid"
                                isDisabled={isLoading}
                                onPress={onUpdate}
                            >
                                <ButtonText>
                                    Update
                                </ButtonText>
                            </Button>


                        </HStack>

                    </FormProvider>
                </VStack>

            </VStack>
        </Container >
    );
}
