import React from "react";

import { useSettings } from "@/contexts/SettingsContext";
import { Image, ImageProps } from 'expo-image';

interface IconLogoProps extends ImageProps {

}

const defaultLogo = require("@/assets/logo/logo.png")

export default function IconLogo(props: IconLogoProps) {
    const { logos } = useSettings()
    return (
        <Image
            cachePolicy="memory-disk"
            contentFit="contain"
            alt="logo"
            source={
                logos.iconLogo
                    ? { uri: logos.iconLogo }
                    : defaultLogo
            }
            className="w-14 h-14 rounded-full"
            {...props}
        />
    );
}
