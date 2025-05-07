import { View, Animated } from "react-native";
import React, { useState, useRef } from "react";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { SafeAreaView } from "react-native-safe-area-context";
import SectionOne from "@/sections/data/SectionOne";
import SectionTwo from "@/sections/data/SectionTwo";

enum DataSections {
    SectionOne = "SectionOne",
    SectionTwo = "SectionTwo",
}
export default function TrackScreen() {
    const { theme } = useSettings()
    const [activeSection, setActiveSection] = useState<DataSections>(DataSections.SectionOne)

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const animateSection = (newSection: DataSections) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: newSection === DataSections.SectionOne ? 100 : -100,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            setActiveSection(newSection);
            // Reset slide position
            slideAnim.setValue(newSection === DataSections.SectionOne ? -100 : 100);
            // Fade in and slide new section
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
        });
    };

    return (
        <SafeAreaView
            className="flex-1"
            edges={["top"]}
            style={{
                backgroundColor: theme.background
            }}
        >
            <View className="flex-1">
                <View>
                    <HStack className="justify-around p-2 bg-background-500">
                        <Button

                            className={`rounded-l-xl rounded-r-none flex-1 ${activeSection === DataSections.SectionOne ? 'bg-primary-500' : 'bg-white'}`}
                            onPress={() => animateSection(DataSections.SectionOne)}
                        >
                            <ButtonText
                                className={activeSection === DataSections.SectionOne ? 'text-white' : 'text-typography-800'}
                            >
                                Section one
                            </ButtonText>
                        </Button>
                        <Button
                            className={`rounded-r-xl rounded-l-none flex-1 ${activeSection === DataSections.SectionTwo ? 'bg-primary-500' : 'bg-white'}`}
                            onPress={() => animateSection(DataSections.SectionTwo)}
                        >
                            <ButtonText
                                className={activeSection === DataSections.SectionTwo ? 'text-white' : 'text-typography-800'}
                            >
                                Section two
                            </ButtonText>
                        </Button>
                    </HStack>
                </View>

                <Animated.View
                    className="bg-gray-50"
                    style={{
                        flex: 1,
                        opacity: fadeAnim,
                        transform: [{ translateX: slideAnim }],
                    }}
                >
                    {activeSection === DataSections.SectionOne ? (
                        <SectionOne />
                    ) : (
                        <SectionTwo />
                    )}
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
