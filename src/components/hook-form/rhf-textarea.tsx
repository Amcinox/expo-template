import React from "react";
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorText } from "../ui/form-control";
import { Textarea, TextareaInput } from "../ui/textarea";



interface RHFTextFieldProps extends React.ComponentProps<typeof Textarea> {
    name: string;
    helperText?: string;
    label?: string;
    type?: React.ComponentProps<typeof TextareaInput>["type"] | "number";
    placeholder?: React.ComponentProps<typeof TextareaInput>["placeholder"];
}

export default function RHFTextarea({
    name,
    helperText,
    label,
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
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
                        <Textarea isInvalid={showError} {...other}>
                            <TextareaInput
                                {...field}
                                value={field.value}
                                onChangeText={(text) => {
                                    field.onChange(text);
                                }}
                            />
                        </Textarea>
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