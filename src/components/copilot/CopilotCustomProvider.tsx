import { useSettings } from "@/contexts/SettingsContext";
import React from "react";
import { CopilotProvider } from "react-native-copilot";
import CopilotTooltip from "./CopilotTooltip";

interface CopilotCustomProviderProps {
    children: React.ReactNode;
}

export default function CopilotCustomProvider({ children }: CopilotCustomProviderProps) {
    const { theme } = useSettings()
    return (
        <CopilotProvider

            labels={{
                previous: "Previous",
                next: "Next",
                skip: "Skip",
                finish: "Finish"
            }}
            tooltipStyle={{
                borderRadius: 10,
                paddingTop: 5,
            }}
            backdropColor={theme.background + "80"}
            tooltipComponent={CopilotTooltip}

        >
            {children}
        </CopilotProvider>
    );
}
