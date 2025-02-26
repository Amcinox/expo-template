import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { useSettings } from '@/contexts/SettingsContext';

interface DefaultFallbackProps {
    title: string;
    message: string;
    animation: any;
}

export const DefaultFallback = ({ title, message, animation }: DefaultFallbackProps) => {
    const { theme } = useSettings()

    return (
        <View

            className='flex-1 p-6 bg-gray-50 dark:bg-gray-800 items-center justify-center'
        >
            <LottieView
                source={animation}
                autoPlay
                loop
                style={{
                    width: 200,
                    height: 200
                }
                }

            />
            <Text className={'text-lg font-bold mt-4 text-center text-gray-800 dark:text-white'}>
                {title}
            </Text>
            <Text className={'text-sm mt-2 text-center text-gray-600 dark:text-gray-300'}>
                {message}
            </Text>
        </View>
    );
};