import React, { useMemo } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

// Type definitions
type DateValue = string | number | Date;

type GroupByPeriod = 'day' | 'week' | 'month' | 'year';

interface GroupByConfig {
    period: GroupByPeriod;
    format: string;
}

interface RenderGroupHeaderProps {
    title: string;
    originalDate: Date;
    rawItems: any[];
}

interface RenderItemProps<T> {
    item: T;
}

type DateKeys<T> = {
    [K in keyof T]: T[K] extends DateValue ? K : never
}[keyof T];

interface GroupedFlashListProps<T extends Record<string, any>> extends Omit<FlashListProps<any>, 'data' | 'renderItem'> {
    /** Array of data items to be grouped and rendered */
    data: T[];
    /** Key in each item that contains the date value (must be a valid date field) */
    dateKey: DateKeys<T>;
    /** Function to render individual items */
    renderItem?: (props: RenderItemProps<T>) => React.ReactElement | null;
    /** Function to render group headers */
    renderGroupHeader?: (props: RenderGroupHeaderProps) => React.ReactElement | null;
    /** How to group the data (day, week, month, year) or custom config */
    groupBy?: GroupByPeriod | GroupByConfig;
    /** Sort order for groups (asc or desc) */
    orderBy?: 'asc' | 'desc';
    /** Custom date validation function */
    isValidDate?: (value: any) => boolean;
    /** Style for the container */
    containerStyle?: ViewStyle;
    /** Style for group headers */
    headerStyle?: ViewStyle;
    /** Style for item containers */
    itemStyle?: ViewStyle;
}

// Helper functions
const isValidDateValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;

    // If it's already a Date object
    if (value instanceof Date) return !isNaN(value.getTime());

    // If it's a timestamp number
    if (typeof value === 'number') return !isNaN(new Date(value).getTime());

    // If it's a string, try to parse it
    if (typeof value === 'string') {
        try {
            const date = new Date(value);
            return !isNaN(date.getTime());
        } catch (e) {
            return false;
        }
    }

    return false;
};

const getDateValue = (value: DateValue): Date => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return parseISO(value);
    return new Date(value);
};

const getGroupFormat = (groupBy: GroupByPeriod | GroupByConfig): GroupByConfig => {
    if (typeof groupBy === 'object') return groupBy;

    switch (groupBy) {
        case 'day':
            return { period: 'day', format: 'MMMM d, yyyy' };
        case 'week':
            return { period: 'week', format: 'MMMM d, yyyy' }; // Week starting date
        case 'year':
            return { period: 'year', format: 'yyyy' };
        case 'month':
        default:
            return { period: 'month', format: 'MMMM yyyy' };
    }
};

const getGroupDate = (date: Date, period: GroupByPeriod): Date => {
    switch (period) {
        case 'day':
            return date; // Use the exact date
        case 'week':
            return startOfWeek(date); // Start of the week containing the date
        case 'year':
            return startOfYear(date); // Start of the year
        case 'month':
        default:
            return startOfMonth(date); // Start of the month
    }
};

// Component implementation
function GroupedFlashList<T extends Record<string, any>>({
    data = [],
    dateKey,
    renderItem,
    renderGroupHeader,
    estimatedItemSize = 50,
    groupBy = 'month',
    orderBy = 'desc',
    isValidDate = isValidDateValue,
    containerStyle,
    headerStyle,
    itemStyle,
    ListEmptyComponent,
    ...flashListProps
}: GroupedFlashListProps<T>) {

    // Process and group the data
    const groupedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const groupConfig = getGroupFormat(groupBy);

        // Group items by date
        const groups: Record<string, { title: string, date: Date, data: T[] }> = {};

        data.forEach(item => {
            const rawDateValue = item[dateKey];

            if (!isValidDate(rawDateValue)) {
                console.warn(`Invalid date value for item:`, item);
                return;
            }

            try {
                const date = getDateValue(rawDateValue);
                const groupDate = getGroupDate(date, groupConfig.period);
                const groupKey = format(groupDate, groupConfig.format);

                if (!groups[groupKey]) {
                    groups[groupKey] = {
                        title: groupKey,
                        date: groupDate,
                        data: [],
                    };
                }

                groups[groupKey].data.push(item);
            } catch (e) {
                console.warn(`Error processing date for item:`, item, e);
            }
        });

        // Convert to array and sort
        const groupsArray = Object.values(groups);

        // Sort groups
        groupsArray.sort((a, b) => {
            return orderBy === 'desc' ? b.date.getTime() - a.date.getTime() : a.date.getTime() - b.date.getTime();
        });

        // Flatten for FlashList
        const flattenedData: any[] = [];
        groupsArray.forEach(group => {
            // Add header
            flattenedData.push({
                type: 'header',
                title: group.title,
                originalDate: group.date,
                rawItems: group.data,
                key: `header-${group.title}`,
            });

            // Add items
            group.data.forEach(item => {
                flattenedData.push({
                    type: 'item',
                    data: item,
                    key: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
                });
            });
        });

        return flattenedData;
    }, [data, dateKey, groupBy, orderBy, isValidDate]);

    // Default render functions
    const DefaultGroupHeader = ({ title }: RenderGroupHeaderProps) => (
        <View style={headerStyle} className="px-4 py-2 bg-gray-100">
            <Text className="text-lg font-bold text-gray-800">{title}</Text>
        </View>
    );

    const DefaultItem = ({ item }: RenderItemProps<T>) => (
        <View style={itemStyle} className="px-6 py-2 border-b border-gray-200">
            <Text className="text-gray-700">• {JSON.stringify(item)}</Text>
        </View>
    );

    // Renderer for FlashList
    const renderListItem = ({ item }: { item: any }) => {
        if (item.type === 'header') {
            return renderGroupHeader
                ? renderGroupHeader({
                    title: item.title,
                    originalDate: item.originalDate,
                    rawItems: item.rawItems
                })
                : <DefaultGroupHeader
                    title={item.title}
                    originalDate={item.originalDate}
                    rawItems={item.rawItems}
                />;
        } else {
            return renderItem
                ? renderItem({ item: item.data })
                : <DefaultItem item={item.data} />;
        }
    };

    return (
        <View style={containerStyle} className="flex-1">
            <FlashList
                data={groupedData}
                renderItem={renderListItem}
                estimatedItemSize={estimatedItemSize}
                ListEmptyComponent={ListEmptyComponent}
                {...flashListProps}
            />
        </View>
    );
}

export default GroupedFlashList;
export type {
    GroupedFlashListProps,
    RenderGroupHeaderProps,
    RenderItemProps,
    GroupByPeriod,
    GroupByConfig,
    DateValue,
    DateKeys
};