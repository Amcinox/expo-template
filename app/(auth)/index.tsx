import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

export default function AuthHome() {
    const router = useRouter();

    const APP_ENV = process.env.EXPO_PUBLIC_ENV;




    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="Login" onPress={() => router.push('/login')} />
            <Button title="Sign Up" onPress={() => router.push('/signup')} />
            <Text style={styles.text}>Current Environment: {APP_ENV}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
