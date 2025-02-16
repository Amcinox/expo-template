import { View, Text } from "react-native";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";

export default function HomeScreen() {

    const [value, setValue] = React.useState('');

    const onChangeText = (text: string) => {
        setValue(text);
    };
    return (
        <View className="flex-1 items-center justify-center bg-gray-100 gap-2">
            <Text>Home Screen</Text>
            <Input
                className="w-1/2"
                variant="outline"
                size="sm"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
            >
                <InputField placeholder="Enter Text here..." />
            </Input>
            <Button variant="outline" className="bg-primary-200"  >
                <Text>Default Update </Text>
            </Button>
        </View>
    );
}
