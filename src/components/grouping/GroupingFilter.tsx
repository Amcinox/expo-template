import React, { useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { Text, TouchableOpacity } from "react-native";
import { Box } from "@/components/ui/box";
import { GroupByPeriod } from "@/components/GroupedFlashList";
import { FontAwesome } from "@expo/vector-icons";
import { useSettings } from "@/contexts/SettingsContext";
import {
    Actionsheet,
    ActionsheetContent,
    ActionsheetItem,
    ActionsheetItemText,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";

type GroupingFilterProps = {
    groupBy: GroupByPeriod;
    orderBy: "asc" | "desc";
    onGroupByChange: (groupBy: GroupByPeriod) => void;
    onOrderByChange: (orderBy: "asc" | "desc") => void;
    actionsheetTitle?: string;
}

export default function GroupingFilter({
    groupBy,
    orderBy,
    onGroupByChange,
    onOrderByChange,
    actionsheetTitle = "Group By"
}: GroupingFilterProps) {
    const { theme } = useSettings();
    const [showActionsheet, setShowActionsheet] = useState(false);

    const groupOptions: { label: string; value: GroupByPeriod }[] = [
        { label: "Group by Day", value: "day" },
        { label: "Group by Week", value: "week" },
        { label: "Group by Month", value: "month" },
        { label: "Group by Year", value: "year" }
    ];

    const toggleOrderBy = () => {
        onOrderByChange(orderBy === "asc" ? "desc" : "asc");
    };

    const currentGroupLabel = groupOptions.find(option => option.value === groupBy)?.label.replace("Group by ", "") || "Group By";

    const handleClose = () => setShowActionsheet(false);

    return (
        <>
            <Box className="my-2">
                <HStack space="md" className="items-center justify-between">
                    <TouchableOpacity
                        className="flex-1 py-3 px-4 rounded-lg border border-background-200 flex-row items-center justify-between bg-white shadow-sm"
                        onPress={() => setShowActionsheet(true)}
                    >
                        <HStack space="sm" className="items-center">
                            <FontAwesome name="filter" size={14} color={theme.primary} />
                            <Text className="text-typography-700 font-medium">{currentGroupLabel}</Text>
                        </HStack>
                        <FontAwesome name="chevron-down" size={12} color={theme.typography} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="py-3 px-4 rounded-lg border border-background-200 flex-row items-center bg-white shadow-sm"
                        onPress={toggleOrderBy}
                    >
                        <HStack space="sm" className="items-center">
                            <FontAwesome
                                name={orderBy === "desc" ? "sort-amount-desc" : "sort-amount-asc"}
                                size={14}
                                color={theme.primary}
                            />
                            <Text className="text-typography-700 font-medium">
                                {orderBy === "desc" ? "Newest" : "Oldest"}
                            </Text>
                        </HStack>
                    </TouchableOpacity>
                </HStack>
            </Box>

            <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
                <ActionsheetBackdrop />
                <ActionsheetContent className="rounded-t-xl">
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>

                    <Box className="px-4 py-2 mb-2">
                        <Heading size="sm">{actionsheetTitle}</Heading>
                    </Box>
                    <Divider />

                    {groupOptions.map((option, index) => (
                        <ActionsheetItem
                            key={option.value}
                            onPress={() => {
                                onGroupByChange(option.value);
                                handleClose();
                            }}
                            className="py-3"
                        >
                            <HStack className="items-center justify-between w-full">
                                <HStack space="md" className="items-center">

                                    <FontAwesome name="calendar" size={20} color={theme.primary} />

                                    <ActionsheetItemText>{option.label}</ActionsheetItemText>
                                </HStack>
                                {groupBy === option.value && (
                                    <FontAwesome name="check" size={16} color={theme.primary} />
                                )}
                            </HStack>
                        </ActionsheetItem>
                    ))}
                </ActionsheetContent>
            </Actionsheet>
        </>
    );
}