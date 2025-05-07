import { View, Text, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import GroupedFlashList, { GroupByPeriod, RenderGroupHeaderProps, RenderItemProps } from "@/components/grouping/GroupedFlashList";
import { HStack } from "@/components/ui/hstack";
import { useCustomerStore } from "@/stores/customerStore";
import { toCurrency } from "@/utils/format-number";
import { FontAwesome } from "@expo/vector-icons";
import { useSettings } from "@/contexts/SettingsContext";
import { format } from "date-fns";
import { VStack } from "@/components/ui/vstack";
import GroupedBarChart from "@/components/grouping/GroupedBarChart";
import { Divider } from "@/components/ui/divider";
import { useCustomToast } from "@/components/CustomToast";
import GroupingFilter from "@/components/grouping/GroupingFilter";

const { width, height } = Dimensions.get("screen");

// Define data type
interface Data {
    id: string;
    amount: number;
    created_at: string;
}

// Generate mock data
const generateMockData = (count: number): Data[] => {
    const result: Data[] = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
        result.push({
            id: `${i + 1}`,
            amount: Math.floor(Math.random() * 10000) + 1000,
            created_at: new Date(
                now.getFullYear(),
                now.getMonth() - Math.floor(i / 30),
                now.getDate() - (i % 30)
            ).toISOString(),
        });
    }
    return result;
};

const ALL_MOCK_DATA: Data[] = generateMockData(75);

export default function SectionOne() {
    const { customer } = useCustomerStore();
    const { theme } = useSettings();
    const { showToast } = useCustomToast();

    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ITEMS_PER_PAGE = 20;
    const [hasScrolledOnce, setHasScrolledOnce] = useState(false);


    const [sectionData, setSectionData] = useState<Data[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [groupBy, setGroupBy] = useState<GroupByPeriod>("month");
    const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");

    const fetchData = async (page = 1, shouldRefresh = false) => {
        if (shouldRefresh) setRefreshing(true);
        if (page > 1) setIsLoadingMore(true);
        if (page === 1 && !shouldRefresh) setIsLoading(true);

        try {
            // Simulate delay
            await new Promise((res) => setTimeout(res, 800));

            const start = (page - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const pageData = ALL_MOCK_DATA.slice(start, end);

            setCurrentPage(page);
            setTotalPages(Math.ceil(ALL_MOCK_DATA.length / ITEMS_PER_PAGE));

            setSectionData((prev) =>
                shouldRefresh || page === 1 ? pageData : [...prev, ...pageData]
            );
        } catch (error) {
            console.error("Failed to fetch data:", error);
            showToast({
                type: "error",
                title: "Error",
                message: "Failed to fetch data",
            });
        } finally {
            setRefreshing(false);
            setIsLoadingMore(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, [customer?.id]);

    const handleRefresh = () => {
        fetchData(1, true);
    };

    const handleLoadMore = () => {
        if (!isLoadingMore && currentPage < totalPages) {
            fetchData(currentPage + 1);
        }
    };

    const handleGroupByChange = (newGroupBy: GroupByPeriod) => {
        setGroupBy(newGroupBy);
        setSelectedDate(undefined);
    };

    const handleOrderByChange = (newOrderBy: "asc" | "desc") => {
        setOrderBy(newOrderBy);
    };

    const renderItem = ({ item }: RenderItemProps<Data>) => {
        const formattedDate = format(new Date(item.created_at), "d MMM");
        return (
            <HStack className="justify-between py-2 px-4 ">
                <Text className="text-typography-700 font-medium">Data usage {formattedDate}</Text>
                <Text className="text-typography-700 font-medium">{toCurrency(item.amount)}</Text>
            </HStack>
        );
    };

    const renderGroupHeader = ({ title, rawItems, collapsible }: RenderGroupHeaderProps) => {
        const totalAdvances = rawItems.reduce((acc, item) => acc + (item.amount || 0), 0);
        const { isCollapsed, onToggleCollapse } = collapsible!;

        return (
            <TouchableOpacity className="px-4 py-3 " onPress={() => {
                onToggleCollapse();
                if (isCollapsed) {
                    setSelectedDate(rawItems[0].created_at);
                } else {
                    setSelectedDate(undefined);
                }
            }}>
                <HStack className="items-center justify-between">
                    <HStack space="md" className="items-center">
                        {isCollapsed ? <FontAwesome name="chevron-down" size={14} color={theme.background} /> : <FontAwesome name="chevron-up" size={14} color={theme.primary} />}
                        <Text className={`text-xl font-bold ${!isCollapsed ? "text-primary-500" : "text-typography-900"}`}>{title}</Text>
                    </HStack>
                    <Text className={`font-bold ${!isCollapsed ? "text-primary-500" : "text-typography-900"}`}>
                        {toCurrency(totalAdvances)}
                    </Text>
                </HStack>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!isLoadingMore) return <View className="h-32" />;
        return (
            <View className="py-4 flex items-center">
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    };

    return (
        <VStack space='md' className="flex-1">
            <VStack className="bg-background-500 p-4" space="md">
                <Heading size="lg" className="text-center text-white">
                    Data Usage
                </Heading>
                <Box className="bg-white rounded-lg shadow-2xl p-4 m-4">
                    <GroupedBarChart
                        isLoading={isLoading}
                        data={sectionData}
                        dateKey="created_at"
                        amountKey="amount"
                        selectedDate={selectedDate}
                        groupBy={groupBy}
                        width={width / 1.2}
                        height={height / 3}
                    />
                </Box>
            </VStack>

            <Box className="flex-1 pb-14">
                {sectionData.length > 0 &&
                    <Box className="px-4">
                        <GroupingFilter
                            groupBy={groupBy}
                            orderBy={orderBy}
                            onGroupByChange={handleGroupByChange}
                            onOrderByChange={handleOrderByChange}
                            actionsheetTitle="Grouped Tracking Withdrawals By"
                        />
                    </Box>}

                <GroupedFlashList<Data>
                    data={sectionData}
                    isLoading={isLoading && !refreshing && !isLoadingMore}
                    className="flex-1"
                    dateKey="created_at"
                    renderItem={renderItem}
                    renderGroupHeader={renderGroupHeader}
                    groupBy={groupBy}
                    orderBy={orderBy}
                    showsVerticalScrollIndicator={false}
                    collapsibleGroups={true}
                    defaultCollapsed={true}
                    estimatedItemSize={50}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    onScrollBeginDrag={() => {
                        if (!hasScrolledOnce) setHasScrolledOnce(true);
                    }}
                    onEndReached={() => {
                        if (hasScrolledOnce && !isLoadingMore && currentPage < totalPages) {
                            handleLoadMore();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ItemSeparatorComponent={() => (
                        <Box className='py-2'>
                            <Divider className="bg-background-100" />
                        </Box>
                    )}
                    EmptyStateComponent={() => (
                        <VStack space="xl" className="flex-1 items-center justify-center">
                            <Heading className="text-center text-typography-700" size="lg">
                                No data available
                            </Heading>
                            <Text className="text-center text-typography-600">
                                No data available for the selected period
                            </Text>

                        </VStack>
                    )}
                />
            </Box>
        </VStack>
    );
}
