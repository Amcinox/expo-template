import React from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Image, ImageProps } from 'expo-image';
interface TextLogoProps extends ImageProps {

}

const defaultLogo = require('@/assets/logo/logo-text.png')
export default function TextLogo(props: TextLogoProps) {
    const { logos } = useSettings()

    return (<Image
        cachePolicy="memory-disk"
        alt='Logo'
        contentFit="contain"
        style={{ width: 200, height: 150 }}
        source={
            logos.textLogo ? {
                uri: logos.textLogo
            } : defaultLogo}

        {...props} />
    );
}
