import React from "react";
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlHelper, FormControlHelperText, FormControlError, FormControlErrorText } from "../ui/form-control";
import {
    Slider,
    SliderThumb,
    SliderTrack,
    SliderFilledTrack,
} from "../ui/slider"



interface RHFSliderProps extends React.ComponentProps<typeof Slider> {
    name: string;
    helperText?: string;
    label?: string;
}

export default function RHFSlider({
    name,
    helperText,
    label,
    isDisabled = false,
    isReadOnly = false,

    ...other
}: RHFSliderProps) {
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
                        className="pb-2"
                    >
                        {label && (
                            <FormControlLabel>
                                <FormControlLabelText>{label}</FormControlLabelText>
                            </FormControlLabel>
                        )}



                        <Slider

                            {...other}
                            defaultValue={field.value}
                            onChange={(value) => field.onChange(value)}
                        >
                            <SliderTrack >
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>


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