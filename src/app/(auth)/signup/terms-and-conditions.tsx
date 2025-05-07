import React from 'react';

// Hooks
import { useRouter } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';

// Components

// Utils
import { static_pages } from '@/api/endpoints';
import { Button, ButtonText } from '@/components/ui/button';
import { WebView } from 'react-native-webview';
import { VStack } from '@/components/ui/vstack';
import Container from '@/components/Container';
import { Heading } from '@/components/ui/heading';
import { useCustomToast } from '@/components/CustomToast';

export default function TermsAndConditionsScreen() {
    const router = useRouter();
    const { toggleSplashLoading } = useSettings()
    const { showToast } = useCustomToast();

    const onDecline = () => {
        showToast({
            title: 'EULA Acceptance Required',
            type: 'error',
            message: "Acceptance of the End User License Agreement is a requirement to use Remirage. If you don't agree, you won't be able to use the app to access your wages."
        })
    }


    return (
        <Container>
            <VStack
                className='flex-1 px-8 py-12'
                space="md"
            >
                <VStack className='flex-1' space="lg">

                    <Heading size="sm" className='text-typography-600 text-center'>Review Terms & Conditions</Heading>
                    <WebView
                        source={{ uri: static_pages.terms_and_conditions }}
                        style={{
                            flex: 1,
                        }}
                        className="min-w-96 w-32"
                        mixedContentMode="always"
                        scalesPageToFit
                        automaticallyAdjustContentInsets={false}
                        onLoadStart={() => {
                            toggleSplashLoading(true)
                        }}
                        onLoadEnd={() => toggleSplashLoading(false)}
                        onError={() => toggleSplashLoading(false)}
                        incognito={true}
                        cacheMode="LOAD_NO_CACHE"
                    />

                    <VStack space="md" className=' justify-center items-center'>
                        <Button

                            className='w-3/4 rounded-3xl h-12'
                            variant="link"
                            onPress={() => router.push({
                                pathname: "/webview",
                                params: {
                                    uri: static_pages.privacy_policy,
                                    title: 'Privacy Policy'
                                }

                            })}
                        >
                            <ButtonText>
                                Privacy Policy
                            </ButtonText>
                        </Button>
                        <Button

                            className='w-3/4 rounded-3xl h-12 disabled'
                            variant='solid'
                            onPress={() => router.push("/signup/register-details")}
                        >
                            <ButtonText className='font-bold'>
                                I Accepte
                            </ButtonText>
                        </Button>
                        <Button
                            variant='outline'
                            className='w-3/4 rounded-3xl h-12'
                            onPress={onDecline}
                        >
                            <ButtonText>
                                I Decline
                            </ButtonText>
                        </Button>
                    </VStack>
                </VStack>
            </VStack>
        </Container>
    );
}