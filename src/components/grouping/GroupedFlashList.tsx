import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ViewStyle, TouchableOpacity } from 'react-native';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { FontAwesome } from '@expo/vector-icons';

// Type definitions
type DateValue = string | number | Date;

type GroupByPeriod = 'day' | 'week' | 'month' | 'year';

interface GroupByConfig {
    period: GroupByPeriod;
    format: string;
}

interface CollapsibleProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    CollapseIcon: React.ComponentType<any>;
    ExpandIcon: React.ComponentType<any>;
}

interface RenderGroupHeaderProps {
    title: string;
    originalDate: Date;
    rawItems: any[];
    collapsible?: CollapsibleProps;
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
    /** Enable collapsible groups */
    collapsibleGroups?: boolean;
    /** Default collapsed state for groups */
    defaultCollapsed?: boolean;
    /** Custom component for collapse icon */
    CollapseIcon?: React.ComponentType<any>;
    /** Custom component for expand icon */
    ExpandIcon?: React.ComponentType<any>;
    /** Icon position (left or right) */
    iconPosition?: 'left' | 'right';
    /** Loading state */
    isLoading?: boolean;
    /** Number of skeleton items to render when loading */
    skeletonCount?: number;
    /** Number of skeleton groups to render when loading */
    skeletonGroupCount?: number;
    /** Custom skeleton for group headers */
    SkeletonGroupHeader?: React.ComponentType<any>;
    /** Custom skeleton for items */
    SkeletonItem?: React.ComponentType<any>;
    /** Custom empty state component */
    EmptyStateComponent?: React.ComponentType<any>;
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

// Default icons
const DefaultCollapseIcon = () => <FontAwesome name="chevron-up" size={14} color="black" />;
const DefaultExpandIcon = () => <FontAwesome name="chevron-down" size={14} color="black" />;

// Default skeleton components
const DefaultSkeletonGroupHeader = ({ headerStyle }: { headerStyle?: ViewStyle }) => (
    <View style={headerStyle} className="px-4 py-2 bg-gray-100">
        <View className="h-5 w-32 bg-gray-300 rounded animate-pulse" />
    </View>
);

const DefaultSkeletonItem = ({ itemStyle }: { itemStyle?: ViewStyle }) => (
    <View style={itemStyle} className="px-6 py-2">
        <View className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
    </View>
);

// Default empty state component
const DefaultEmptyStateComponent = () => (
    <View className="flex-1 justify-center items-center py-8">
        <Text className="text-gray-500 text-lg">No Data Available</Text>
    </View>
);

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
    collapsibleGroups = false,
    defaultCollapsed = false,
    CollapseIcon = DefaultCollapseIcon,
    ExpandIcon = DefaultExpandIcon,
    iconPosition = 'left',
    isLoading = false,
    skeletonCount = 5,
    skeletonGroupCount = 2,
    SkeletonGroupHeader = DefaultSkeletonGroupHeader,
    SkeletonItem = DefaultSkeletonItem,
    EmptyStateComponent = DefaultEmptyStateComponent,
    ...flashListProps
}: GroupedFlashListProps<T>) {
    // Track collapsed state for each group
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    // Toggle collapsed state for a group
    const toggleGroupCollapse = useCallback((groupKey: string) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupKey]: !prev[groupKey]
        }));
    }, []);

    // Initialize collapsed state for groups
    const initializeCollapsedState = useCallback((groupKey: string) => {
        if (collapsibleGroups && defaultCollapsed && collapsedGroups[groupKey] === undefined) {
            setCollapsedGroups(prev => ({
                ...prev,
                [groupKey]: true
            }));
            return true;
        }
        return collapsedGroups[groupKey] || false;
    }, [collapsibleGroups, defaultCollapsed, collapsedGroups]);

    // Generate skeleton data when loading
    const skeletonData = useMemo(() => {
        if (!isLoading) return [];

        const skeletonItems: any[] = [];

        for (let i = 0; i < skeletonGroupCount; i++) {
            // Add header skeleton
            skeletonItems.push({
                type: 'skeleton-header',
                key: `skeleton-header-${i}`,
            });

            // Add item skeletons
            for (let j = 0; j < skeletonCount; j++) {
                skeletonItems.push({
                    type: 'skeleton-item',
                    key: `skeleton-item-${i}-${j}`,
                });
            }
        }

        return skeletonItems;
    }, [isLoading, skeletonCount, skeletonGroupCount]);

    // Process and group the data
    const groupedData = useMemo(() => {
        // Return skeleton data when loading
        if (isLoading) return skeletonData;

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

                    // Initialize collapsed state for new groups
                    initializeCollapsedState(groupKey);
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
            const groupKey = group.title;
            const isCollapsed = collapsibleGroups ? collapsedGroups[groupKey] : false;

            flattenedData.push({
                type: 'header',
                title: groupKey,
                originalDate: group.date,
                rawItems: group.data,
                key: `header-${groupKey}`,
                isCollapsed,
                groupKey,
            });

            // Add items only if group is not collapsed or collapsible is disabled
            if (!collapsibleGroups || !isCollapsed) {
                group.data.forEach(item => {
                    flattenedData.push({
                        type: 'item',
                        data: item,
                        key: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
                    });
                });
            }
        });

        return flattenedData;
    }, [data, dateKey, groupBy, orderBy, isValidDate, collapsibleGroups, collapsedGroups, initializeCollapsedState, isLoading, skeletonData]);

    // Default render functions
    const DefaultGroupHeader = ({
        title,
        collapsible
    }: RenderGroupHeaderProps) => {
        if (!collapsible) {
            return (
                <View style={headerStyle} className="px-4 py-2 bg-gray-100">
                    <Text className="text-lg font-bold text-gray-800">{title}</Text>
                </View>
            );
        }

        const { isCollapsed, onToggleCollapse, CollapseIcon: CollapseIconComponent, ExpandIcon: ExpandIconComponent } = collapsible;

        return (
            <TouchableOpacity
                onPress={onToggleCollapse}
                style={[headerStyle, { flexDirection: 'row', alignItems: 'center' }]}
                className="px-4 py-2 bg-gray-100"
            >
                {iconPosition === 'left' && (
                    <View style={{ marginRight: 8 }}>
                        {isCollapsed ? <ExpandIconComponent /> : <CollapseIconComponent />}
                    </View>
                )}

                <Text className="text-lg font-bold text-gray-800" style={{ flex: 1 }}>{title}</Text>

                {iconPosition === 'right' && (
                    <View style={{ marginLeft: 8 }}>
                        {isCollapsed ? <ExpandIconComponent /> : <CollapseIconComponent />}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const DefaultItem = ({ item }: RenderItemProps<T>) => (
        <View style={itemStyle} className="px-6 py-2 border-b border-gray-200">
            <Text className="text-gray-700">• {JSON.stringify(item)}</Text>
        </View>
    );

    // Renderer for FlashList
    const renderListItem = ({ item }: { item: any }) => {
        if (item.type === 'skeleton-header') {
            return <SkeletonGroupHeader headerStyle={headerStyle} />;
        } else if (item.type === 'skeleton-item') {
            return <SkeletonItem itemStyle={itemStyle} />;
        } else if (item.type === 'header') {
            const collapsibleProps = collapsibleGroups ? {
                isCollapsed: item.isCollapsed,
                onToggleCollapse: () => toggleGroupCollapse(item.groupKey),
                CollapseIcon,
                ExpandIcon
            } : undefined;

            return renderGroupHeader
                ? renderGroupHeader({
                    title: item.title,
                    originalDate: item.originalDate,
                    rawItems: item.rawItems,
                    collapsible: collapsibleProps
                })
                : <DefaultGroupHeader
                    title={item.title}
                    originalDate={item.originalDate}
                    rawItems={item.rawItems}
                    collapsible={collapsibleProps}
                />;
        } else {
            return renderItem
                ? renderItem({ item: item.data })
                : <DefaultItem item={item.data} />;
        }
    };

    // Custom empty component based on loading state
    const renderEmptyComponent = () => {
        if (isLoading) return null;
        if (ListEmptyComponent) return ListEmptyComponent;
        return <EmptyStateComponent />;
    };

    return (
        <View style={containerStyle} className="flex-1">
            <FlashList
                data={groupedData}
                renderItem={renderListItem}
                estimatedItemSize={estimatedItemSize}
                ListEmptyComponent={renderEmptyComponent()}
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
    DateKeys,
    CollapsibleProps
};