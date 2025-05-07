import React from "react";
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorText } from "../ui/form-control";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel, } from "../ui/checkbox";
import { CheckIcon } from "../ui/icon";


interface Props extends Partial<React.ComponentProps<typeof Checkbox>> {
    name: string;
    helperText?: string;
    label?: string;
    checkboxLabel?: string;
    value?: any;
}
// ----------------------------------------------------------------------



export default function RHFCheckbox({
    name,
    helperText,
    label,
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
    checkboxLabel,
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
                        isRequired={isRequired}
                        isDisabled={isDisabled}
                        isReadOnly={isReadOnly}
                    >
                        {label && (
                            <FormControlLabel>
                                <FormControlLabelText>{label}</FormControlLabelText>
                            </FormControlLabel>
                        )}

                        <Checkbox {...other}
                            value={field.value ? "1" : "0"}
                            isChecked={field.value}
                            onChange={(value) => field.onChange(value)}
                        >
                            <CheckboxIndicator>
                                <CheckboxIcon as={CheckIcon} />
                            </CheckboxIndicator>
                            <CheckboxLabel>{checkboxLabel}</CheckboxLabel>
                        </Checkbox>


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