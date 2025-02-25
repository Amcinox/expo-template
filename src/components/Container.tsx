import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import React from "react";
interface ScreenContainerProps {
    children: React.ReactNode
}

export default function ScreenContainer({ children }: ScreenContainerProps) {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}>
                <View className="flex-1">
                    {children}
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}