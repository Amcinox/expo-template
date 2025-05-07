import { useSettings } from "@/contexts/SettingsContext";
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { RadialSlider } from "./react-native-wheel-input";
import { Keyboard, StyleSheet, Text, TextStyle, TouchableWithoutFeedback, View, ViewStyle } from "react-native";

interface AdvanceRadialSliderProps {
    amount: number;
    onChange: (value: number) => void;
    max: number,
    min: number;
}

export default function AdvanceRadialSlider({
    amount,
    onChange,
    max,
    min
}: AdvanceRadialSliderProps) {
    const { theme } = useSettings();
    // Track when changes are coming from inside vs outside
    const isInternalChange = useRef(false);
    // Track the last value to avoid unnecessary updates
    const lastValueRef = useRef(amount);

    // Memoize gradient configuration
    const linearGradient = useMemo(() => [
        {
            color: theme.primary!,
            offset: "0%",
        },
        {
            color: theme.background!,
            offset: "50%",
        },
        {
            color: theme.primary!,
            offset: "85%",
        },
        {
            color: theme.background!,
            offset: "100%",
        },
    ], [theme.primary, theme.background]);

    // This effect syncs the external value with the component
    useEffect(() => {
        // Only update if this is an external change
        if (!isInternalChange.current && amount !== lastValueRef.current) {
            lastValueRef.current = amount;
        }
    }, [amount]);

    // Handle changes from the slider
    const handleChange = useCallback((value: number) => {
        // Mark this as an internal change
        isInternalChange.current = true;
        // Update the reference
        lastValueRef.current = value;
        // Call the parent's onChange
        onChange(value);
        // Reset the flag after the update
        setTimeout(() => {
            isInternalChange.current = false;
        }, 0);
    }, [onChange]);

    return (
        <RadialSlider
            variant={'radial-circle-slider'}
            value={amount}
            min={min}
            max={max}
            linearGradient={linearGradient}
            lineColor={theme.primary}
            startAngle={90}
            onChange={handleChange}
        />
    );
}