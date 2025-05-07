import { useState } from "react";
import * as Tooltip from "universal-tooltip";
import { View, Pressable, Platform } from "react-native";
import { useSettings } from "@/contexts/SettingsContext";
const TriggerView = Platform.OS === "web" ? View : Pressable;

interface TooltipWrapperProps {
    children?: React.ReactNode;
    tooltipText?: string;
}
export default function TooltipWrapper({ children, tooltipText }: TooltipWrapperProps) {
    const [open, setOpen] = useState(false);
    const { theme } = useSettings()
    return (<Tooltip.Root
        {...Platform.select({
            web: {},
            default: {
                open,
                onDismiss: () => {
                    setOpen(false);
                },
            },
        })}
    >
        <Tooltip.Trigger>
            <TriggerView
                className="bg-white"
                {...Platform.select({
                    web: {},
                    default: {
                        open,
                        onPress: () => {
                            setOpen(true);
                        },
                    },
                })}
            >
                {children}
            </TriggerView>
        </Tooltip.Trigger>
        <Tooltip.Content
            sideOffset={3}
            containerStyle={{
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 8,
                paddingBottom: 8,

            }}
            onTap={() => {
                setOpen(false);
            }}
            dismissDuration={500}
            disableTapToDismiss
            side="bottom"
            presetAnimation="fadeIn"
            backgroundColor={theme.background}
            borderRadius={10}
        >
            <Tooltip.Text
                text={tooltipText}
                style={{
                    color: "#FFF",
                    fontSize: 12,

                }} />
        </Tooltip.Content>
    </Tooltip.Root>
    )

}