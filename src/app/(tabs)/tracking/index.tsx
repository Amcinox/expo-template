import { View, Text } from "react-native";
import React from "react";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import GroupedFlashList, { RenderGroupHeaderProps, RenderItemProps } from "@/components/GroupedFlashList";


// Define your data type
interface TodoItem {
    id: string | number;
    title: string;
    description?: string;
    created_at: string;
    completed: boolean;
}

// Sample data
const todoItems: TodoItem[] = [
    { id: 1, title: "Complete project proposal", created_at: "2025-02-15T10:30:00Z", completed: false },
    { id: 2, title: "Review team updates", created_at: "2025-02-18T14:00:00Z", completed: true },
    { id: 3, title: "Planning session", created_at: "2025-01-10T09:15:00Z", completed: true },
    { id: 4, title: "Client meeting", created_at: "2025-01-22T16:30:00Z", completed: false },
    { id: 5, title: "Release v2.0", created_at: "2024-12-05T11:00:00Z", completed: true },
    { id: 6, title: "Budget review", created_at: "2024-12-20T15:45:00Z", completed: false },
];



export default function TrackWithdraealsSection() {


    const renderTodoItem = ({ item }: RenderItemProps<TodoItem>) => (
        <View className="flex-row items-center px-4 py-2 border-b border-gray-200">
            <View className={`w-3 h-3 rounded-full mr-2 ${item.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <Text className="text-base flex-1">{item.title}</Text>
        </View>
    );

    // Custom group header renderer
    const renderGroupHeader = ({ title, rawItems }: RenderGroupHeaderProps) => {
        const totalItems = rawItems.length;
        const completedItems = rawItems.filter((item: TodoItem) => item.completed).length;

        return (
            <View className="px-4 py-3 bg-blue-100">
                <Text className="text-xl font-bold text-blue-800">{title}</Text>
                <Text className="text-sm text-blue-600">
                    {completedItems} of {totalItems} completed
                </Text>
            </View>
        );
    };



    return (
        <View className="flex-1 ">
            <Box className="flex-1 bg-background-500">
                <Heading size="md" className="text-center text-white">Tracking Withdraeals</Heading>
            </Box>
            <Box className="flex-1 bg-gray-50 ">
                <GroupedFlashList<TodoItem>
                    data={todoItems}
                    dateKey="created_at"
                    renderItem={renderTodoItem}
                    renderGroupHeader={renderGroupHeader}
                    groupBy="month" // Can be 'day', 'week', 'month', 'year' or custom config
                    orderBy="desc"
                    estimatedItemSize={50}
                />
            </Box>
        </View>
    );
}
