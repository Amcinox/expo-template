import { View } from "react-native";
import React from "react";
import LottieView from 'lottie-react-native';


interface SplashLoadingProps {
    theme: any;
    show: boolean;
}
export default function SplashLoading({ theme, show }: SplashLoadingProps) {

    if (!show) return null;
    return (
        <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(72,81,86,0.2)",
        }} className="flex-1 justify-center items-center">
            <LottieView
                style={{
                    width: 200,
                    height: 200,

                }}
                colorFilters={[
                    {
                        keypath: 'Layer 1',
                        color: theme?.primary!,
                    },
                    {
                        keypath: 'Layer 2',
                        color: theme?.secondary!,
                    },
                    {
                        keypath: 'Layer 3',
                        color: theme?.secondary!,
                    }
                ]}

                source={require('@/assets/lottie/round-loading.json')}
                autoPlay loop />
        </View>

    );
}
