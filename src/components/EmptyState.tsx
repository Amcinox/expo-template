import React from 'react';
import { View, Text } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';
import notFound from '@/assets/lottie/not-found.json';
import { Button, ButtonText } from './ui/button';
import { VStack } from './ui/vstack';
import { useSettings } from '@/contexts/SettingsContext';

export type EmptyStateProps = {

    lottieSource?: string | AnimationObject | {
        uri: string;
    } | undefined;
    animationSize?: number | string;
    autoPlay?: boolean;
    loop?: boolean;
    speed?: number;


    title?: string;
    description?: string;

    containerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    animationContainerClassName?: string;

    // Action
    actionLabel?: string;
    onAction?: () => void;
    showAction?: boolean;
    actionButtonClassName?: string;
    actionTextClassName?: string;


    // Custom components
    customTitle?: React.ReactNode;
    customDescription?: React.ReactNode;
    customAction?: React.ReactNode;
    customAnimation?: React.ReactNode;
};

const EmptyState: React.FC<EmptyStateProps> = ({
    // Animation props
    lottieSource,
    animationSize = 200,
    autoPlay = true,
    loop = true,
    speed = 1,

    // Content props
    title = 'No data found',
    description = 'There is no data to display at the moment.',

    // Styling props
    containerClassName = 'items-center justify-center p-6',
    titleClassName = 'text-xl font-bold text-center mt-4 text-gray-800',
    descriptionClassName = 'text-sm text-center mt-2 text-gray-600',
    animationContainerClassName = 'items-center justify-center',

    // Action props
    actionLabel = 'Refresh',
    onAction,
    showAction = false,
    actionButtonClassName = 'mt-4 bg-primary-500',
    actionTextClassName = 'text-white',

    // Custom components
    customTitle,
    customDescription,
    customAction,
    customAnimation,
}) => {

    const { theme } = useSettings()
    return (
        <View className={`flex-1 ${containerClassName}`}>
            <VStack space="md">
                {customAnimation || (
                    <View className={animationContainerClassName}>
                        <LottieView
                            source={lottieSource || notFound}
                            style={{
                                width: typeof animationSize === 'number' ? animationSize : parseInt(animationSize as string, 10),
                                height: typeof animationSize === 'number' ? animationSize : parseInt(animationSize as string, 10)
                            }}
                            colorFilters={[
                                {
                                    keypath: 'decoratio2',
                                    color: theme?.primary!,
                                },
                                {
                                    keypath: 'Ellipse 1',
                                    color: theme?.secondary!,
                                },
                                {
                                    keypath: 'Ellipse Path 1',
                                    color: theme?.primary!,
                                },

                            ]}
                            autoPlay={autoPlay}
                            loop={loop}
                            speed={speed}
                        />
                    </View>
                )}

                {customTitle || (
                    <Text className={titleClassName}>
                        {title}
                    </Text>
                )}

                {customDescription || (
                    <Text className={descriptionClassName}>
                        {description}
                    </Text>
                )}

                {showAction && (onAction || customAction) && (
                    customAction || (
                        <Button
                            className={actionButtonClassName}
                            onPress={onAction}
                        >
                            <ButtonText className={actionTextClassName}>
                                {actionLabel}
                            </ButtonText>
                        </Button>
                    )
                )}
            </VStack>
        </View>
    );
};

export default EmptyState;