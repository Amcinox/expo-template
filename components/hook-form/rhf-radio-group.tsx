import React from "react";
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorText } from "../ui/form-control";
import { CircleIcon } from "../ui/icon";
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from "../ui/radio";
import { VStack } from "../ui/vstack";
import { IIconComponentType } from "@gluestack-ui/icon/lib/createIcon";
import { SvgProps } from "react-native-svg";
import { ColorValue } from "react-native";


interface Option {
    value: string;
    label: string;
    icon?: IIconComponentType<SvgProps | {
        fill?: ColorValue;
        stroke?: ColorValue;
    }>
}
interface Props extends Partial<React.ComponentProps<typeof RadioGroup>> {
    name: string;
    helperText?: string;
    label?: string;
    radioLabel?: string;
    value?: any;
    options: Option[];
}
// ----------------------------------------------------------------------



export default function RHFRadioGroup({
    name,
    helperText,
    label,
    isDisabled = false,
    isReadOnly = false,
    radioLabel,
    options,
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
                        // isRequired={isRequired}
                        isDisabled={isDisabled}
                        isReadOnly={isReadOnly}
                    >
                        {label && (
                            <FormControlLabel>
                                <FormControlLabelText>{label}</FormControlLabelText>
                            </FormControlLabel>
                        )}
                        <RadioGroup
                            value={field.value}
                            onChange={field.onChange}
                            {...other}
                        >
                            <VStack space="sm">
                                {options.map((option) => (
                                    <Radio key={option.value} value={option.value}>
                                        <RadioIndicator>
                                            <RadioIcon as={option.icon || CircleIcon} />
                                        </RadioIndicator>
                                        <RadioLabel>{option.label}</RadioLabel>
                                    </Radio>
                                ))}
                            </VStack>
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