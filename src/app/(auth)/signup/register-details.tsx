import React from 'react';

// Hooks
import { useCustomerStore } from '@/stores/customerStore';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';


// Components
import Container from '@/components/Container';
import { Button, ButtonText } from '@/components/ui/button';
import RHFTextField from '@/components/hook-form/rhf-text-field';
import FormProvider from '@/components/hook-form/form-provider';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';

// Validation
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomerVerificationSchema, CustomerVerificationPayload } from '@/schemas/auth/customerVerification.schema';
import { useCustomToast } from '@/components/CustomToast';

export default function RegisterDetailsScreen() {
    const router = useRouter();
    const { verifyCustomer } = useCustomerStore()
    const { showToast } = useCustomToast()
    const form = useForm<CustomerVerificationPayload>({
        resolver: zodResolver(CustomerVerificationSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            mobile_number: '',
        },
    });


    const { handleSubmit } = form;

    const onSubmit = handleSubmit(async (data: CustomerVerificationPayload) => {
        try {
            await verifyCustomer(data)
            router.push({
                pathname: "/signup/otp-verification",
            });
        } catch (error) {
            console.log({ errora: error })
            showToast({
                title: 'Error',
                type: 'error',
                message: " Incorrect details"
            })
            form.setError('mobile_number', {
                type: 'manual',
                message: "Incorrect details"
            })
        }

    })



    return (
        <Container>
            <VStack
                className='flex-1 justify-center items-center px-8'
                space='xl'
            >
                <FormProvider methods={form}>

                    <Heading size="sm" className='text-typography-600 text-center'>Register Details</Heading>
                    <HStack space='xl'>
                        <RHFTextField
                            formProps={{
                                className: "flex-1"
                            }}
                            size="xl"
                            className="rounded-md  w-full"
                            name="first_name"
                            placeholder="First Name"
                        />
                        <RHFTextField
                            formProps={{
                                className: "flex-1"
                            }}
                            size="xl"
                            className="rounded-md  w-full "
                            name="last_name"
                            placeholder="Last Name"
                        />
                    </HStack>
                    <HStack space='xl'>
                        <RHFTextField
                            formProps={{
                                className: "flex-1"
                            }}
                            size="xl"
                            InputFieldProps={{
                                keyboardType: "phone-pad"
                            }}
                            className="w-full "
                            name="mobile_number"
                            placeholder="Mobile Number"
                        />
                    </HStack>
                    <Button
                        className='w-full rounded-3xl h-12'
                        variant='solid'
                        onPress={onSubmit}
                    >
                        <ButtonText>
                            Verify
                        </ButtonText>
                    </Button>


                </FormProvider>

            </VStack>
        </Container>
    );
}