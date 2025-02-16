import React from "react";
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorText } from "../ui/form-control";
import { CircleIcon } from "../ui/icon";
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from "../ui/radio";


interface Props extends Partial<React.ComponentProps<typeof RadioGroup>> {
    name: string;
    helperText?: string;
    label?: string;
    radioLabel?: string;
    value?: any;
}
// ----------------------------------------------------------------------



export default function RHFRadio({
    name,
    helperText,
    label,
    isDisabled = false,
    isReadOnly = false,
    radioLabel,
    ...other
}: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => {
                const showError = !!error

                return (
                    <FormControl
                        isInvalid={showError}
                        isDisabled={isDisabled}
                        isReadOnly={isReadOnly}
                    >
                        {label && (
                            <FormControlLabel>
                                <FormControlLabelText>{label}</FormControlLabelText>
                            </FormControlLabel>
                        )}
                        <RadioGroup>
                            <Radio {...other} value={field.value} >
                                <RadioIndicator>
                                    <RadioIcon as={CircleIcon} />
                                </RadioIndicator>
                                <RadioLabel>{radioLabel}</RadioLabel>
                            </Radio>
                        </RadioGroup>
                        {helperText && !showError && (
                            <FormControlHelper>
                                <FormControlHelperText>{helperText}</FormControlHelperText>
                            </FormControlHelper>
                        )}

                        {showError && (
                            <FormControlError>
                                <FormControlErrorText>{error?.message || helperText}</FormControlErrorText>
                            </FormControlError>
                        )}
                    </FormControl>
                );
            }}
        />
    );
}