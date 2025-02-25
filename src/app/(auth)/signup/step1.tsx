import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function WalkthroughScreen() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Step One </Text>
            <Button
                title="Next"
                onPress={() => router.push("/signup/step2")}
            />
        </View>
    );
}