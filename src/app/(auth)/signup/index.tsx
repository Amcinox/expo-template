import React, { useEffect, useRef, useState } from "react";

// Hooks
import { useTranslation } from "react-i18next";
import { Link, useNavigation, useRouter } from "expo-router";

// Components
import { Button, ButtonText } from "@/components/ui/button";
import PagerView from 'react-native-pager-view';
import { Box } from "@/components/ui/box";
import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import Container from "@/components/Container";
import { Heading } from "@/components/ui/heading";

const walkthroughs = [
    {
        title: "Step 1 ",
        image: require('@/assets/images/illustrations/walkthrough-1.png')
    },
    {
        title: "Step 2",
        image: require('@/assets/images/illustrations/walkthrough-2.png')
    },
    {
        title: "Step 3",
        image: require('@/assets/images/illustrations/walkthrough-3.png')
    }
];

export default function SignupScreen() {
    const navigation = useNavigation();

    const { t } = useTranslation();
    const pagerRef = useRef<any>(null);
    const [currentPage, setCurrentPage] = useState(0);




    const onNext = () => {
        pagerRef.current.setPage(currentPage + 1);
    };

    const lastStep = currentPage === walkthroughs.length - 1;

    useEffect(() => {
        navigation.setOptions({

            headerRight: () => (
                lastStep ? null : <Link href="/signup/terms-and-conditions" asChild>
                    <Button
                        variant="link"
                    >
                        <ButtonText className='text-white'>
                            Skip
                        </ButtonText>
                    </Button>
                </Link>
            ),

        });
    }, [navigation, currentPage]);



    const handlePageChange = (event: any) => {
        setCurrentPage(event.nativeEvent.position);
    };



    return (
        <Container>
            <Box className="flex-1">
                <PagerView
                    ref={pagerRef}
                    style={{ flex: 2 }}
                    initialPage={0}
                    onPageSelected={handlePageChange}
                >
                    {walkthroughs.map((walkthrough, index) => (
                        <VStack key={index + 1} className="items-center  justify-center" space="2xl">
                            <Image
                                alt="walkthrough"
                                size="2xl"

                                source={walkthrough.image} />


                            <Heading size="sm" className='text-typography-600 text-center w-3/4'>  {t(walkthrough.title)}</Heading>
                        </VStack>
                    ))}
                </PagerView>




                <VStack className="flex-1 justify-center  items-center " space="4xl">
                    <HStack
                        className="justify-center items-center" space="md"
                    >
                        {walkthroughs.map((_, index) => (
                            <Box
                                key={index}
                                className={`w-3 h-3 rounded-3xl 
                                ${index === currentPage ? 'bg-primary-500' : 'bg-background-100'}
                                `}
                            />
                        ))}
                    </HStack>

                    {!lastStep ?
                        <Button
                            variant="outline"
                            className="rounded-3xl h-12   w-3/4"
                            onPress={onNext}
                        >
                            <ButtonText>
                                Next
                            </ButtonText>
                        </Button> :
                        <Link asChild href="/signup/terms-and-conditions">
                            <Button
                                variant="solid"
                                className="rounded-3xl h-12  w-3/4"

                            >
                                <ButtonText>
                                    Get Started
                                </ButtonText>
                            </Button>
                        </Link>
                    }
                </VStack>
            </Box>
        </Container>
    );
}

