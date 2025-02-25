import React from "react";
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorText } from "../ui/form-control";
import { ChevronDownIcon } from "../ui/icon";
import { IIconComponentType } from "@gluestack-ui/icon/lib/createIcon";
import { SvgProps } from "react-native-svg";
import { ColorValue } from "react-native";
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from "../ui/select";


interface Option {
    value: string;
    label: string;
    icon?: IIconComponentType<SvgProps | {
        fill?: ColorValue;
        stroke?: ColorValue;
    }>,
    disabled?: boolean;
}
interface Props extends Partial<React.ComponentProps<typeof Select>> {
    name: string;
    helperText?: string;
    label?: string;
    value?: any;
    options: Option[];
    variant?: React.ComponentProps<typeof SelectTrigger>["variant"];
    size?: React.ComponentProps<typeof SelectTrigger>["size"];
}
// ----------------------------------------------------------------------



export default function RHFSelect({
    name,
    helperText,
    label,
    isDisabled = false,
    options,
    variant,
    size,
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


                        <Select onValueChange={field.onChange} selectedValue={field.value} {...other} >
                            <SelectTrigger variant={variant} size={size} className="flex items-center justify-between">
                                <SelectInput placeholder="Select option" value={
                                    options.find((option) => option.value === field.value)?.label
                                }
                                />
                                <SelectIcon className="mr-2" as={ChevronDownIcon} />
                            </SelectTrigger>

                            <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    {options.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            label={option.label}
                                            value={option.value}
                                            isDisabled={option.disabled}

                                        />
                                    ))}

                                </SelectContent>
                            </SelectPortal>
                        </Select>
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