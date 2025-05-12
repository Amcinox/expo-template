"use client"
import React from "react"
import { Text } from "@/components/ui/text"
import { View, TouchableOpacity, Dimensions, Platform, Image, StyleSheet } from "react-native"
import { useSettings } from "@/contexts/SettingsContext"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import Svg, { Path } from "react-native-svg"
import IconLogo from "@/components/logo/IconLogo"


const { width } = Dimensions.get("window")

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { theme } = useSettings()
    const tabBarHeight = 70
    const centerButtonSize = 80
    const curveRadius = centerButtonSize / 1.8
    const cornerRadius = 20

    const tabBarPath = createTabBarPath(width, tabBarHeight, width / 2, curveRadius, cornerRadius)

    return (
        <View style={styles.container}  >
            <Svg
                width={width}
                height={tabBarHeight}

            >
                <Path
                    d={tabBarPath}
                    fill="white"
                />
            </Svg>

            <View
                className="mx-2"
                style={[styles.tabItemsContainer, { height: tabBarHeight }]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key]
                    const label = options.title || route.name
                    const isFocused = state.index === index

                    if (route.name === "home") {
                        return <View key={route.key} style={{ width: centerButtonSize }} />
                    }



                    return (
                        <TouchableOpacity
                            key={route.key}
                            testID={`tab-${route.name}`}
                            className="py-2  justify-center flex-1 items-center"
                            style={[
                                styles.tabItem,

                            ]}
                            onPress={() => {
                                const event = navigation.emit({
                                    type: "tabPress",
                                    target: route.key,
                                    canPreventDefault: true
                                })
                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name)
                                }
                            }}
                        >
                            {options.tabBarIcon &&
                                options.tabBarIcon({
                                    color: isFocused ? theme.primary! : "#8F9396",
                                    size: 24,
                                    focused: isFocused
                                })}
                            <Text
                                style={{
                                    color: isFocused ? theme.primary : "#8F9396",
                                    fontSize: 12,
                                    fontWeight: isFocused ? "bold" : "normal",
                                }}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {/* Center floating button */}
            <TouchableOpacity
                style={[
                    styles.centerButton,
                    {
                        backgroundColor: state.index === 2 ? theme.background : "#ffffff",
                        width: centerButtonSize,
                        height: centerButtonSize,
                        bottom: tabBarHeight - centerButtonSize / 2,
                        left: width / 2 - centerButtonSize / 2,
                    }
                ]}
                onPress={() => navigation.navigate("home")}
            >
                <IconLogo
                    style={{
                        width: centerButtonSize * 0.6,
                        height: centerButtonSize * 0.6,
                        opacity: state.index === 2 ? 1 : 0.7
                    }}


                    className="h-12 w-12 " />
            </TouchableOpacity>
        </View>
    )
}

// Helper function to create SVG path for tab bar with cutout and rounded corners
function createTabBarPath(width: number, height: number, centerX: number, cutoutRadius: number, cornerRadius: number = 20): string {
    // Start path at the point after the top-left corner
    let path = `M${cornerRadius},0`;

    // Draw top edge until the cutout
    path += ` L${centerX - cutoutRadius},0`;

    // Draw the semi-circle cutout (clockwise)
    path += ` A${cutoutRadius},${cutoutRadius} 0 0,0 ${centerX + cutoutRadius},0`;

    // Continue top edge until before the top-right corner
    path += ` L${width - cornerRadius},0`;

    // Draw top-right corner
    path += ` Q${width},0 ${width},${cornerRadius}`;

    // Draw right edge straight to bottom
    path += ` L${width},${height}`;

    // Draw bottom edge (straight, no corners)
    path += ` L0,${height}`;

    // Draw left edge straight up to the top-left corner arc
    path += ` L0,${cornerRadius}`;

    // Draw top-left corner
    path += ` Q0,0 ${cornerRadius},0`;

    // Close the path
    path += ` Z`;

    return path;
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    background: {
        position: 'absolute',
        bottom: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    tabItemsContainer: {

        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'space-around',
    },
    tabItem: {

        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    centerButton: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 10,
    }
});