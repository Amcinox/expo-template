import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';

interface DefaultFallbackProps {
    title: string;
    message: string;
    animation: any;
    buttonHandler?: () => void
    buttonText?: string
}

export const DefaultFallback = ({ title, message, animation, buttonHandler, buttonText }: DefaultFallbackProps) => {
    const { theme } = useSettings()

    return (
        <VStack

            space='md'
            className='flex-1 p-6 bg-gray-50 dark:bg-gray-800 items-center justify-center'
        >
            <LottieView
                source={animation}
                autoPlay
                loop
                style={{
                    width: 300,
                    height: 300,


                }
                }

            />
            <Text className={'text-lg font-bold mt-4 text-center text-gray-800 dark:text-white'}>
                {title}
            </Text>
            <Text className={'text-sm mt-2 text-center text-gray-600 dark:text-gray-300'}>
                {message}
            </Text>

            {typeof buttonHandler === "function" ?
                <Button
                    onPress={buttonHandler}
                    className="w-full "
                >
                    <ButtonText >
                        {buttonText}
                    </ButtonText>
                </Button> : null}
        </VStack>
    );
};