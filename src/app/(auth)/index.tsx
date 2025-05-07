import React from 'react';
import { useRouter } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import TextLogo from '@/components/logo/TextLogo';
export default function AuthHome() {
    const router = useRouter();



    return (
        <VStack
            testID="landing-screen"
            space="4xl" className='w-full h-full flex justify-around items-center bg-background-500'
        >
            <VStack space='4xl' className='w-full h-1/2 justify-center items-center mt-20' >
                <TextLogo className='w-100' />
                <Text className='text-white text-2xl text-center  w-52' numberOfLines={2}>
                    Welcome
                </Text>

                <Text className='text-white text-center w-3/4'>
                    Remirage Expo Template is a template that helps you to build your app faster and easier. It is built with Expo, React Native, and TypeScript. It is a perfect starting point for your next project.
                </Text>

            </VStack>



            <VStack space='xl' className='w-full h-1/2 items-center '>
                <Button
                    className='w-3/4 rounded-3xl h-12'
                    variant="solid"
                    testID='login-button'
                    onPress={() => router.push('/login')} >
                    <ButtonText>
                        Login
                    </ButtonText>
                </Button>
                <Button
                    className='w-3/4 rounded-3xl h-12'
                    variant="outline"
                    onPress={() => router.push('/signup')} >
                    <ButtonText>
                        Sign Up
                    </ButtonText>
                </Button>
                {__DEV__ ?
                    <Button
                        className='w-3/4 rounded-3xl h-12'
                        variant="outline"
                        onPress={() => router.push("/debugModal")} >
                        <ButtonText>
                            Debug
                        </ButtonText>
                    </Button> : null}

                <Text
                    className='text-white text-xs pt-4'
                >
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </VStack>
        </VStack>

    );
}

