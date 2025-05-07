import { FormControl, FormControlLabel, FormControlLabelText } from "./ui/form-control";
import { Input, InputField } from "./ui/input";

export default function ReadOnlyTextField({
    value, label, className
}: {
    value: string;
    label: string,
    className?: string
}) {
    return (
        <FormControl className={'space-y-2 ' + className}>
            <FormControlLabel>
                <FormControlLabelText>{label}</FormControlLabelText>
            </FormControlLabel>
            <Input
                size="md"
                className='bg-gray-100 rounded-lg'
                isReadOnly
            >
                <InputField
                    value={value}
                    type="text"
                    className='text-gray-700'
                />
            </Input>
        </FormControl>
    )
}
