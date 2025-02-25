import React from "react";
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorText } from "../ui/form-control";
import { Switch } from "../ui/switch"

import colors from "tailwindcss/colors"


interface Props extends Partial<React.ComponentProps<typeof Switch>> {
    name: string;
    helperText?: string;
    label?: string;
    value?: any;
}
// ----------------------------------------------------------------------



export default function RHFSwitch({
    name,
    helperText,
    label,
    isDisabled = false,
    // isReadOnly = false,
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
                    >
                        {label && (
                            <FormControlLabel>
                                <FormControlLabelText>{label}</FormControlLabelText>
                            </FormControlLabel>
                        )}
                        <Switch
                            trackColor={{ false: colors.neutral[300], true: colors.neutral[600] }}
                            thumbColor={colors.neutral[50]}
                            ios_backgroundColor={colors.neutral[300]}
                            {...other}
                            onToggle={(value) => field.onChange(value)}
                            value={field.value}

                        />
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