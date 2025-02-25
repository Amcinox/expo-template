import React, { PropsWithChildren } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

interface ErrorBoundaryProps extends PropsWithChildren {
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.props.onError?.(error, errorInfo);
        console.error('Error caught by boundary:', error, errorInfo);
    }

    resetError = (): void => {
        this.setState({ hasError: false, error: null });
    };

    contactSupport = (): void => {
        Linking.openURL('mailto:support@yourapp.com');
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
                    <LottieView
                        source={require('@/assets/lottie/round-loading.json')}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                    <Text style={styles.title}>Oops! Something went wrong</Text>
                    <Text style={styles.error}>{this.state.error?.message}</Text>
                    <TouchableOpacity style={styles.button} onPress={this.resetError}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.supportButton} onPress={this.contactSupport}>
                        <Text style={styles.supportButtonText}>Contact Support</Text>
                    </TouchableOpacity>
                </Animated.View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    animation: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#343a40',
    },
    error: {
        color: '#dc3545',
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    supportButton: {
        backgroundColor: '#6c757d',
        padding: 15,
        borderRadius: 8,
    },
    supportButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});