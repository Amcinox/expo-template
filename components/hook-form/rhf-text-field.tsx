import React from "react";
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorText } from "../ui/form-control";
import { Input, InputField, } from "../ui/input";



interface RHFTextFieldProps extends React.ComponentProps<typeof Input> {
    name: string;
    helperText?: string;
    label?: string;
    type?: React.ComponentProps<typeof InputField>["type"] | "number";
    placeholder?: React.ComponentProps<typeof InputField>["placeholder"];
}

export default function RHFTextField({
    name,
    helperText,
    type = 'text',
    label,
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
    placeholder,
    variant = "outline",
    size,
    ...other
}: RHFTextFieldProps) {
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
                        isRequired={isRequired}
                        isDisabled={isDisabled}
                        isReadOnly={isReadOnly}
                    >
                        {label && (
                            <FormControlLabel>
                                <FormControlLabelText>{label}</FormControlLabelText>
                            </FormControlLabel>
                        )}
                        <Input variant={variant} size={size} isInvalid={showError} {...other}>
                            <InputField
                                {...field}
                                placeholder={placeholder}
                                type={type as any}
                                value={type === 'number' && field.value === 0 ? '' : field.value}
                                onChangeText={(text) => {
                                    if (type === 'number') {
                                        const numberValue = Number(text);
                                        if (isNaN(numberValue)) {
                                            field.onChange('');
                                        } else {
                                            field.onChange(numberValue);
                                        }
                                    } else {
                                        field.onChange(text);
                                    }
                                }}
                            />
                        </Input>
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