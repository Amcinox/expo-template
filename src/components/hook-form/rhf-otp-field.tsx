"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { View } from "react-native"
import { Controller, useFormContext } from "react-hook-form"
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    FormControlError,
    FormControlErrorText,
} from "../ui/form-control"
import { Input, InputField } from "../ui/input"
import { HStack } from "../ui/hstack"

interface RHFOTPFieldProps {
    name: string
    label?: string
    length?: number
    onComplete?: (otpString: string) => void
    onDelete?: () => void
    isRequired?: boolean
    isDisabled?: boolean
    isReadOnly?: boolean
}

export default function RHFOTPField({
    name,
    label,
    length = 6,
    onComplete,
    onDelete,
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
}: RHFOTPFieldProps) {
    const { control, watch } = useFormContext()
    const [otp, setOtp] = useState<string[]>(Array(length).fill(""))
    const inputRefs = useRef<(any | null)[]>([])

    // Watch the form field value
    const formValue = watch(name)

    // Sync form value with OTP state
    useEffect(() => {
        if (!formValue) {
            setOtp(Array(length).fill(""))
        }
    }, [formValue, length])

    const handleChange = useCallback(
        (index: number, value: string, onChange: (value: string) => void) => {
            if (value.length > 1) {
                // Handle pasting
                const pastedValue = value.slice(0, length)
                const newOtp = [...Array(length).fill("")]
                for (let i = 0; i < pastedValue.length; i++) {
                    if (index + i < length) {
                        newOtp[index + i] = pastedValue[i]
                    }
                }
                setOtp(newOtp)
                onChange(newOtp.join(""))

                if (newOtp.every((digit) => digit !== "")) {
                    onComplete?.(newOtp.join(""))
                }
                // Focus on the next empty input or the last input
                const nextEmptyIndex = newOtp.findIndex((digit) => digit === "")
                if (nextEmptyIndex !== -1) {
                    inputRefs.current[nextEmptyIndex]?.focus()
                } else {
                    inputRefs.current[length - 1]?.focus()
                }
            } else {
                // Handle single digit input
                const newOtp = [...otp]
                newOtp[index] = value
                setOtp(newOtp)
                onChange(newOtp.join(""))

                if (value !== "" && index < length - 1) {
                    inputRefs.current[index + 1]?.focus()
                }
                if (newOtp.every((digit) => digit !== "")) {
                    onComplete?.(newOtp.join(""))
                }
            }
        },
        [otp, length, onComplete],
    )

    const handleKeyPress = useCallback(
        (index: number, key: string, onChange: (value: string) => void) => {
            if (key === "Backspace") {
                const newOtp = [...otp]
                newOtp[index] = ""
                setOtp(newOtp)
                onChange(newOtp.join(""))

                if (index > 0) {
                    inputRefs.current[index - 1]?.focus()
                }
                if (index === 1 && otp[0] === "") {
                    onDelete?.()
                }
            }
        },
        [otp, onDelete],
    )

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                const showError = !!error

                return (
                    <FormControl isInvalid={showError} isRequired={isRequired} isDisabled={isDisabled} isReadOnly={isReadOnly}>
                        {label && (
                            <FormControlLabel>
                                <FormControlLabelText>{label}</FormControlLabelText>
                            </FormControlLabel>
                        )}
                        <HStack
                            space="md"
                            className="w-full"
                        >
                            {Array.from({ length }).map((_, index) => (
                                <Input key={index}
                                    size="xl"
                                    className="
                                    text-center  w-12 h-12 rounded-xl
                                    border border-gray-300
                                    bg-white
                                    "
                                >
                                    <InputField
                                        type="text"
                                        className="text-center"
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        keyboardType="numeric"
                                        maxLength={length}
                                        value={otp[index]}
                                        onChangeText={(text) => handleChange(index, text, onChange)}
                                        onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key, onChange)}
                                    />
                                </Input>
                            ))}
                        </HStack>
                        {showError && (
                            <FormControlError>
                                <FormControlErrorText>{error?.message}</FormControlErrorText>
                            </FormControlError>
                        )}
                    </FormControl>
                )
            }}
        />
    )
}