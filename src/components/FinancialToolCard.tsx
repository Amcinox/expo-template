import Animated, { FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { Pressable } from "./ui/pressable"
import { Text } from "./ui/text"
import { VStack } from "./ui/vstack"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)


interface FinancialToolCardProps {
    icon: {
        type: any
        name: string
    }
    label: string
    color: string
    index: number
}
export default function FinancialToolCard({ icon, label, color, index }: FinancialToolCardProps) {
    const Icon = icon.type
    const scale = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        }
    })

    const handlePressIn = () => {
        scale.value = withSpring(0.95)
    }

    const handlePressOut = () => {
        scale.value = withSpring(1)
    }

    return (
        <Animated.View entering={FadeInRight.delay(100 * index).springify()}>
            <AnimatedPressable
                style={animatedStyle}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="bg-white p-4 rounded-2xl shadow-sm  w-32 h-32 justify-center items-center"
            >
                <VStack className="justify-center items-center" space="md">
                    <Icon name={icon.name} size={28} color={color} />
                    <Text className="text-center text-xs font-medium">{label}</Text>
                </VStack>
            </AnimatedPressable>
        </Animated.View>
    )
}