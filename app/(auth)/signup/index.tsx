import { View, Text, Button } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

export default function SignupScreen() {
    const router = useRouter();
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Sign up Main</Text>
            <Button
                title="Start"
                onPress={() => router.push("/signup/step1")}
            />
        </View>
    );
}
