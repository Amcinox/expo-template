import React, { Fragment } from 'react';
import { View } from 'react-native';
import { CopilotStep, walkthroughable, CopilotProps } from 'react-native-copilot';
const WalkthroughableView = walkthroughable(View);

interface CopilotWrapperProps {
    children: React.ReactNode;
    text: string;
    order: number;
    name: string;
    stepProps?: CopilotProps
}
export default function CopilotWrapper({
    children,
    text,
    order,
    name,
    stepProps = {}
}: CopilotWrapperProps) {
    return (
        <CopilotStep
            text={text}
            order={order}
            name={name}
            {...stepProps}
        >
            <WalkthroughableView
                style={{
                    flex: 0,
                    width: "auto",
                    height: "auto"
                }}>
                {children}
            </WalkthroughableView>
        </CopilotStep>
    );
};