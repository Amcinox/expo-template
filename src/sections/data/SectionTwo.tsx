import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, RefreshControl, ActivityIndicator, Dimensions, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import moment from 'moment';
import { FormControl, FormControlLabelText } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { useSettings } from '@/contexts/SettingsContext';
import { Box } from '@/components/ui/box';
import GroupedFlashList, { GroupByPeriod, RenderGroupHeaderProps, RenderItemProps } from '@/components/grouping/GroupedFlashList';
import { format } from 'date-fns';
import { toCurrency } from '@/utils/format-number';
import { FontAwesome } from '@expo/vector-icons';
import { Divider } from '@/components/ui/divider';
import { Accordion, AccordionContent, AccordionContentText, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/ui/icon';
import GroupedBarChart from '@/components/grouping/GroupedBarChart';
import GroupingFilter from '@/components/grouping/GroupingFilter';

const { width, height } = Dimensions.get("screen")




export interface Record {
    id: string
    units: number
    unitRate: number
    date: Date
    created_at: Date
    updated_at: Date
    amount: number
    description: string
}


// Generate mock data
const generateMockRecords = (fromDate: Date, toDate: Date, count: number): Record[] => {
    const records: Record[] = [];
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const dateRange = endDate.getTime() - startDate.getTime();

    for (let i = 0; i < count; i++) {
        const randomDateOffset = Math.random() * dateRange;
        const recordDate = new Date(startDate.getTime() + randomDateOffset);

        const hours = Math.floor(Math.random() * 8) + 4; // 4-12 hours
        const hourlyRate = Math.floor(Math.random() * 20) + 15; // $15-35/hour

        records.push({
            id: `record-${i}`,
            date: recordDate,
            units: hours,
            unitRate: hourlyRate,
            amount: hours * hourlyRate,
            description: `Shift at ${Math.random() > 0.5 ? 'Downtown Location' : 'Uptown Location'}`,
            created_at: new Date(),
            updated_at: new Date(),

        });
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Filter mock data based on date range
const filterMockData = (data: Record[], fromDate: Date, toDate: Date, type: string): Record[] => {
    return data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= fromDate && recordDate <= toDate;
    });
};

export default function SectionTwo() {
    const { theme } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);

    // Mock data store
    const [allMockData, setAllMockData] = useState<Record[]>([]);
    const [records, setRecords] = useState<Record[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [groupBy, setGroupBy] = useState<GroupByPeriod>("month");
    const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
    const ITEMS_PER_PAGE = 20;

    const [fromDate, setFromDate] = useState<Date>(moment().subtract(6, 'month').toDate());
    const [toDate, setToDate] = useState<Date>(moment().toDate());

    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    const [filterParams, setFilterParams] = useState({
        page: 1,
        per_page: ITEMS_PER_PAGE,
        from: format(fromDate, 'yyyy-MM-dd'),
        to: format(toDate, 'yyyy-MM-dd'),
        type: 'daily-shift-earning'
    });

    // Initialize mock data
    useEffect(() => {
        // Generate 100 records for the full dataset
        const mockData = generateMockRecords(
            moment().subtract(12, 'month').toDate(),
            moment().toDate(),
            100
        );
        setAllMockData(mockData);
    }, []);

    // Function to fetch records based on filter parameters
    const fetchRecords = useCallback(async () => {
        setIsLoading(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const params = {
                page: 1,
                per_page: ITEMS_PER_PAGE,
                from: format(fromDate, 'yyyy-MM-dd'),
                to: format(toDate, 'yyyy-MM-dd'),
                type: 'daily-shift-earning'
            };

            // Filter the mock data based on date range
            const filteredData = filterMockData(
                allMockData,
                fromDate,
                toDate,
                params.type
            );

            // Paginate the data
            const paginatedData = filteredData.slice(0, params.per_page);

            setRecords(paginatedData);
            setFilterParams(params);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fromDate, toDate, allMockData]);

    // Initial data fetch
    useEffect(() => {
        if (allMockData.length > 0) {
            fetchRecords();
        }
    }, [fetchRecords, allMockData]);

    // Handle refresh action
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate new mock data
            const newMockData = generateMockRecords(
                moment().subtract(12, 'month').toDate(),
                moment().toDate(),
                100
            );
            setAllMockData(newMockData);

            // Fetch the first page with the new data
            await fetchRecords();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Handle load more action
    const handleLoadMore = async () => {
        // Don't load more if already loading or if we're on the first page
        if (isPaginationLoading || isLoading || isRefreshing) return;

        const nextPage = currentPage + 1;
        const totalItems = nextPage * ITEMS_PER_PAGE;

        // Check if there's more data to load
        const filteredData = filterMockData(
            allMockData,
            fromDate,
            toDate,
            filterParams.type
        );

        if (records.length >= filteredData.length) return;

        setIsPaginationLoading(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Get the next page of data
            const nextPageData = filteredData.slice(
                records.length,
                Math.min(totalItems, filteredData.length)
            );

            // Append the new data to the existing records
            setRecords(prev => [...prev, ...nextPageData]);
            setCurrentPage(nextPage);
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            setIsPaginationLoading(false);
        }
    };

    const handleDateChange = (
        setDate: (date: Date) => void,
        setShow: (show: boolean) => void
    ) => (event: DateTimePickerEvent, selectedDate?: Date) => {
        // Always hide the date picker on Android after selection
        if (Platform.OS === 'android') {
            setShow(false);
        }

        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleGroupByChange = (newGroupBy: GroupByPeriod) => {
        setGroupBy(newGroupBy);
    };

    const handleOrderByChange = (newOrderBy: "asc" | "desc") => {
        setOrderBy(newOrderBy);
    };

    const renderItem = ({ item }: RenderItemProps<Record>) => {
        return (
            <Accordion
                variant="unfilled"
                type="single"
                isCollapsible={true}
                className="mx-6 rounded-xl bg-white"
            >
                <AccordionItem value={item.id} >
                    <AccordionHeader>
                        <AccordionTrigger>
                            {({ isExpanded }) => {
                                return (
                                    <HStack className='justify-between w-full'>
                                        <VStack>
                                            <AccordionTitleText className='text-typography-700 text-sm'>
                                                {moment(item.date).format('MMMM DD, YYYY')}
                                            </AccordionTitleText>
                                            <AccordionTitleText className='text-typography-500 text-xs'>
                                                {item.description}
                                            </AccordionTitleText>
                                        </VStack>

                                        <HStack>
                                            <AccordionContentText className='text-primary-500 text-md font-medium'>
                                                {toCurrency((item.units * item.unitRate))}
                                            </AccordionContentText>
                                            {isExpanded ? (
                                                <AccordionIcon as={ChevronUpIcon} className="ml-3" />
                                            ) : (
                                                <AccordionIcon as={ChevronDownIcon} className="ml-3" />
                                            )}
                                        </HStack>
                                    </HStack>
                                )
                            }}
                        </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                        <AccordionContentText className='text-typography-500 text-sm'>
                            {item.units} hours worked
                        </AccordionContentText>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    };

    const renderGroupHeader = ({ title, rawItems }: RenderGroupHeaderProps) => {
        return (
            <HStack className="px-4 py-3 mx--2 bg-gray-200 rounded-xl items-center" space='md'>
                <FontAwesome name="calendar" size={14} color={theme.background} />
                <Text className={`text-xl font-bold text-typography-900`}>{title}</Text>
            </HStack>
        );
    };

    const renderFooter = () => {
        if (!isPaginationLoading) return <View className="h-32" />;
        return (
            <View className="py-4 flex items-center">
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    };

    const renderEmptyData = () => {
        return (
            <VStack space="xl"
                className="bg-white rounded-lg shadow-2xl p-2 justify-center items-center py-12">
                <FontAwesome name="exclamation-triangle" size={32} color={theme.primary} />
                <Text className="text-typography-700 text-lg">No records found</Text>
            </VStack>
        );
    };

    return (
        <VStack
            space='md'
            className="flex-1 bg-background-500">
            <Heading size="lg" className="text-center text-white">Daily Shifts</Heading>
            <VStack
                className="px-4">
                <Box className="bg-white rounded-lg shadow-2xl p-2">
                    <HStack space='md' className='justify-around'>
                        <FormControl>
                            <HStack className='items-center'>
                                <FormControlLabelText>
                                    From:
                                </FormControlLabelText>
                                {Platform.OS === 'android' ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => setShowFromDatePicker(true)}
                                            disabled={isLoading || isRefreshing}
                                        >
                                            <Text className="text-primary-600 ml-2">
                                                {moment(fromDate).format('MM/DD/YYYY')}
                                            </Text>
                                        </TouchableOpacity>
                                        {showFromDatePicker && (
                                            <DateTimePicker
                                                value={fromDate}
                                                mode="date"
                                                onChange={handleDateChange(setFromDate, setShowFromDatePicker)}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <DateTimePicker
                                        disabled={isLoading || isRefreshing}
                                        neutralButton={{
                                            label: 'Cancel',
                                        }}
                                        value={fromDate}
                                        mode="date"
                                        onChange={handleDateChange(setFromDate, setShowFromDatePicker)}
                                    />
                                )}
                            </HStack>
                        </FormControl>
                        <FormControl className='direction-row'>
                            <HStack className='items-center'>
                                <FormControlLabelText>
                                    To:
                                </FormControlLabelText>
                                {Platform.OS === 'android' ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => setShowToDatePicker(true)}
                                            disabled={isLoading || isRefreshing}
                                        >
                                            <Text className="text-primary-600 ml-2">
                                                {moment(toDate).format('MM/DD/YYYY')}
                                            </Text>
                                        </TouchableOpacity>
                                        {showToDatePicker && (
                                            <DateTimePicker
                                                maximumDate={new Date()}
                                                value={toDate}
                                                mode="date"
                                                onChange={handleDateChange(setToDate, setShowToDatePicker)}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <DateTimePicker
                                        disabled={isLoading || isRefreshing}
                                        maximumDate={new Date()}
                                        value={toDate}
                                        mode="date"
                                        onChange={handleDateChange(setToDate, setShowToDatePicker)}
                                    />
                                )}
                            </HStack>
                        </FormControl>
                    </HStack>
                    <GroupedBarChart
                        isLoading={isLoading}
                        data={records}
                        dateKey="date"
                        amountKey="amount"
                        groupBy={groupBy}
                        width={width / 1.2}
                        height={height / 4}
                        EmptyComponent={renderEmptyData}
                    />

                    {records?.length > 0 ?
                        <GroupingFilter
                            groupBy={groupBy}
                            orderBy={orderBy}
                            onGroupByChange={handleGroupByChange}
                            onOrderByChange={handleOrderByChange}
                            actionsheetTitle="Grouped Tracking Withdrawals By"
                        />
                        : null}
                </Box>
            </VStack>
            <Box className="flex-1 p-4">
                <GroupedFlashList<Record>
                    data={records}
                    isLoading={isLoading && !isRefreshing && !isPaginationLoading}
                    className="flex-1"
                    dateKey="date"
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    renderGroupHeader={renderGroupHeader}
                    groupBy={groupBy}
                    orderBy={orderBy}
                    ItemSeparatorComponent={() => <Box className='py-2'>
                        <Divider />
                    </Box>
                    }
                    SkeletonGroupHeader={
                        () => <HStack className="px-4 py-4 bg-gray-100 rounded-xl items-center" space='md'>
                            <View className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                        </HStack>
                    }
                    SkeletonItem={() =>
                        <VStack className='justify-between w-full bg-white px-4 py-4 rounded-xl' >
                            <HStack className='justify-between w-full'>
                                <VStack space='md'>
                                    <View className="h-2 w-32 bg-gray-200 rounded animate-pulse" />
                                    <View className="h-2 w-32 bg-gray-200 rounded animate-pulse" />
                                </VStack>
                                <VStack space='md'>
                                    <View className="h-2 w-8 bg-gray-200 rounded animate-pulse" />
                                </VStack>
                            </HStack>
                        </VStack>
                    }
                    EmptyStateComponent={renderEmptyData}
                    estimatedItemSize={50}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            </Box>
        </VStack>
    );
}