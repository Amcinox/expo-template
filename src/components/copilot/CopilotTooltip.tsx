import { TooltipProps, useCopilot } from "react-native-copilot";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";
import { useSettings } from "@/contexts/SettingsContext";


export default function CopilotTooltip({ labels }: TooltipProps) {
    const { updateWalkThrough } = useSettings()
    const {
        isFirstStep,
        isLastStep,
        currentStep,
        start,
        stop,
        goToNext,
        goToPrev,

    } = useCopilot();




    const onFinished = () => {
        if (isLastStep && currentStep?.name === "proceed-button") {
            updateWalkThrough(true)
            stop()
        } else {
            updateWalkThrough(false)
        }
        stop()
    }
    return (
        <VStack
            space="md"
            className="w-full"
        >
            <Text className="text-typography-700 font-medium">
                {currentStep?.text}
            </Text>
            <HStack
                space="md"
                className="justify-end w-full p-2">
                {!isFirstStep && (
                    <Button onPress={goToPrev} variant="outline">
                        <ButtonText>
                            {labels.previous}
                        </ButtonText>
                    </Button>
                )}
                {!isLastStep ? (

                    <Button onPress={goToNext} variant="outline">
                        <ButtonText>
                            {labels.next}
                        </ButtonText>
                    </Button>
                ) : (
                    <Button onPress={onFinished}>
                        <ButtonText>
                            {labels.finish}
                        </ButtonText>
                    </Button>
                )}
            </HStack>
        </VStack>
    );
};

