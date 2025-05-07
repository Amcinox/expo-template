import React from "react";
import { Pressable } from "../ui/pressable";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function GoBack() {
    const navigation = useRouter();
    return (
        <Pressable
            onPress={() => navigation.back()}
        >
            <MaterialIcons
                name="arrow-back-ios"
                size={24}
                color="white"
            />
        </Pressable>

    );
}
