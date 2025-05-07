import React from 'react';


// Hooks
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

// Components
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import Container from '@/components/Container';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import RHFOTPField from '@/components/hook-form/rhf-otp-field';
import FormProvider from '@/components/hook-form/form-provider';

// Validation
import { zodResolver } from '@hookform/resolvers/zod';
import { OTPSchema, OTPPayload } from '@/schemas/auth/otp.schema';
import { useCustomerStore } from '@/stores/customerStore';
import { useSettings } from '@/contexts/SettingsContext';
import { useCustomToast } from '@/components/CustomToast';


export default function OTPVerificationScreen() {
    const router = useRouter();
    const { showToast } = useCustomToast();



    const { customer, verifyOTP, resentOTP } = useCustomerStore()
    const { toggleSplashLoading } = useSettings()



    const { username, password, } = useLocalSearchParams<{
        username: string
        password: string,
    }>()



    const form = useForm<OTPPayload>({
        resolver: zodResolver(OTPSchema),
        defaultValues: {

        },
    });

    const { handleSubmit } = form;
    const onSubmit = handleSubmit(async (data: OTPPayload) => {
        try {
            toggleSplashLoading(true)
            router.push({
                pathname: "/signup/create-account",
                params: {
                    username: username,
                    password: password,
                }
            });
        } catch (error) {
            form.setError('verificationCode', {
                type: 'manual',
                message: 'Invalid OTP'
            })
        } finally {
            toggleSplashLoading(false)
        }
    })

    const onResent = async () => {
        try {
            toggleSplashLoading(true)
            await resentOTP(customer?.phoneNumber!)
            showToast({
                type: "success",
                message: "OTP resent successfully",
                duration: 3000,
                placement: "top",
            });
        }
        catch (error) {
            console.log(error)
        } finally {
            toggleSplashLoading(false)
        }
    }



    return (
        <Container>
            <VStack
                className='flex-1 justify-center items-center'
                space='xl'

            >
                <Heading size="sm" className='text-typography-600'>OTP Verification</Heading>
                <Text className='text-center text-typography-500'>
                    Please enter the OTP code sent to your mobile
                </Text>
                <Text>{customer?.phoneNumber}</Text>

                <FormProvider methods={form}>
                    <RHFOTPField
                        name="verificationCode"
                        onComplete={(otp) => onSubmit()} />
                </FormProvider>
                <Text>I don't receive a code</Text>

                <Button
                    onPress={onResent}
                    className='w-3/4 rounded-3xl h-12'
                    variant="link"
                >
                    <ButtonText className='underline'>
                        Resent OTP
                    </ButtonText>
                </Button>

            </VStack>
        </Container>
    );
}