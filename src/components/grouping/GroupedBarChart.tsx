import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
    VictoryBar,
    VictoryChart,
    VictoryTheme,
    VictoryZoomContainer,
    VictoryAxis,
    VictoryStack,
    VictoryLabel,
} from 'victory-native';
import { isEqual, isEmpty } from 'lodash';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear, isWithinInterval } from 'date-fns';
import { useSettings } from '@/contexts/SettingsContext';
import { toCurrency } from '@/utils/format-number';

// Type definitions
export type DateValue = string | number | Date;

export type GroupByPeriod = 'day' | 'week' | 'month' | 'year';

interface GroupByConfig {
    period: GroupByPeriod;
    format: string;
}

interface GroupedBarChartProps {
    /** Original data array with dates */
    data: any[];
    /** Key in data that contains date value */
    dateKey: string;
    /** Key in data that contains amount/value to chart */
    amountKey: string;
    /** Function to handle selection changes */
    handleChange?: (key: string, value: any) => void;
    /** Currently selected date/period */
    selectedDate?: DateValue;
    /** How to group the data (day, week, month, year) */
    groupBy?: GroupByPeriod | GroupByConfig;
    /** Chart height */
    height?: number;
    /** Chart width */
    width?: number;
    /** Custom date validation function */
    isValidDate?: (value: any) => boolean;
    /** Format for x-axis labels */
    xAxisFormat?: string;
    /** Custom domain for x-axis zoom */
    zoomDomain?: { x: [number, number] };
    /** Orientation of the chart */
    orientation?: 'vertical' | 'horizontal';
    /**  Orientation of Axis */
    axisOrientation?: 'left' | 'right';
    /** Loading state */
    isLoading?: boolean;
    /** Custom empty state component */
    EmptyComponent?: React.ReactNode | (() => React.ReactNode);
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
            return { period: 'day', format: 'MMM d' };
        case 'week':
            return { period: 'week', format: 'MMM d' }; // Week starting date
        case 'year':
            return { period: 'year', format: 'yyyy' };
        case 'month':
        default:
            return { period: 'month', format: 'MMM yyyy' };
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

// New helper function to check if a date is within a group's range
const isDateInGroup = (date: Date, groupDate: Date, period: GroupByPeriod): boolean => {
    const nextPeriodDate = new Date(groupDate);

    switch (period) {
        case 'day':
            // For day, check if it's the same day
            return format(date, 'yyyy-MM-dd') === format(groupDate, 'yyyy-MM-dd');
        case 'week':
            // For week, check if date is within the week
            nextPeriodDate.setDate(nextPeriodDate.getDate() + 7);
            break;
        case 'month':
            // For month, check if date is within the month
            nextPeriodDate.setMonth(nextPeriodDate.getMonth() + 1);
            break;
        case 'year':
            // For year, check if date is within the year
            nextPeriodDate.setFullYear(nextPeriodDate.getFullYear() + 1);
            break;
    }

    return date >= groupDate && date < nextPeriodDate;
};

const getXAxisFormat = (groupBy: GroupByPeriod): string => {
    switch (groupBy) {
        case 'day':
            return 'd';
        case 'week':
            return 'MMM d';
        case 'year':
            return 'yyyy';
        case 'month':
        default:
            return 'MMM';
    }
};

// Loading skeleton component
const SkeletonChart = ({ height = 270, width = 330 }) => {
    const { theme } = useSettings();

    return (
        <View style={{ height, width, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', height: height * 0.7, alignItems: 'flex-end', justifyContent: 'space-evenly', width: '100%' }}>
                {[...Array(5)].map((_, i) => (
                    <View key={i} style={{
                        height: `${30 + Math.random() * 70}%`,
                        width: width / 12,
                        backgroundColor: theme.background || '#ccc',
                        opacity: 0.3,
                        borderRadius: 4,
                        marginHorizontal: 8
                    }} />
                ))}
            </View>
            <View style={{ height: 20, marginTop: 10, width: '100%', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                {[...Array(5)].map((_, i) => (
                    <View key={i} style={{
                        height: 8,
                        width: width / 12,
                        backgroundColor: theme.background || '#ccc',
                        opacity: 0.3,
                        borderRadius: 4,
                        marginHorizontal: 8
                    }} />
                ))}
            </View>
        </View>
    );
};

// Default empty state component
const DefaultEmptyState = ({ height = 270, width = 330 }) => {
    const { theme } = useSettings();

    return (
        <View style={{ height, width, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.text || '#333', fontSize: 16 }}>No Data Available</Text>
        </View>
    );
};

// Main component
export default function GroupedBarChart({
    data = [],
    dateKey = 'date',
    amountKey = 'amount',
    handleChange = () => { },
    selectedDate,
    groupBy = 'month',
    axisOrientation = "right",
    height = 300,
    width = 330,
    isValidDate = isValidDateValue,
    xAxisFormat,
    zoomDomain = { x: [0.5, 5] },
    isLoading = false,
    EmptyComponent,
}: GroupedBarChartProps) {
    const [externalMutation, setExternalMutation] = useState<any>(undefined);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const prevSelectedItem = useRef(selectedItem);
    const { theme } = useSettings();

    const groupedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const groupConfig = getGroupFormat(groupBy);
        const formattedGroupBy = typeof groupBy === 'object' ? groupBy.period : groupBy;

        const groups: Record<string, { total: number; date: Date; items: any[] }> = {};

        data.forEach(item => {
            const rawDateValue = item[dateKey];

            if (!isValidDate(rawDateValue)) return;

            try {
                const date = getDateValue(rawDateValue);
                const groupDate = getGroupDate(date, formattedGroupBy);
                const groupKey = format(groupDate, groupConfig.format);

                if (!groups[groupKey]) {
                    groups[groupKey] = { total: 0, date: groupDate, items: [] };
                }

                groups[groupKey].total += Number(item[amountKey] || 0);
                groups[groupKey].items.push(item);
            } catch (e) {
                console.warn(`Error processing date for item:`, item, e);
            }
        });

        return Object.entries(groups).map(([key, value], index) => ({
            x: index + 1,
            amount: value.total,
            month: key,
            // label: toCurrency(value.total),
            date: value.date,
            items: value.items,
        }))
    }, [data, dateKey, amountKey, groupBy]);


    // Find selected group based on selectedDate
    useEffect(() => {
        if (selectedDate && groupedData.length > 0) {
            try {
                const date = getDateValue(selectedDate);
                const formattedGroupBy = typeof groupBy === 'object' ? groupBy.period : groupBy;

                // Find the matching group based on whether the selected date falls within its range
                const selectedGroup = groupedData.find(item =>
                    isDateInGroup(date, item.date, formattedGroupBy)
                );

                if (selectedGroup) {
                    if (!isEqual(selectedGroup, selectedItem)) {
                        setSelectedItem(selectedGroup);
                    }
                } else {
                    // No matching group found
                    setSelectedItem({});
                }
            } catch (e) {
                console.warn(`Error processing selectedDate:`, selectedDate, e);
                setSelectedItem({});
            }
        } else if (!selectedDate && !isEmpty(selectedItem)) {
            setSelectedItem({});
        }
    }, [selectedDate, groupedData, groupBy]);

    useEffect(() => {
        if (!isEqual(prevSelectedItem.current, selectedItem)) {
            if (!isEmpty(selectedItem)) {
                resetMutation();
                setTimeout(() => highlightSelectedItem(selectedItem), 0);
            } else {
                resetMutation();
            }
        }
        prevSelectedItem.current = selectedItem;
    }, [selectedItem]);

    const highlightSelectedItem = (selectedItem: any) => {
        const newMutation: {
            childName: string;
            target: string;
            mutation: () => { style: { fill: string; opacity: number } };
            eventKey: string;
        }[] = [
                {
                    childName: 'Bar-1',
                    target: 'data',
                    mutation: () => ({ style: { fill: theme.primary!, opacity: 0.2 } }),
                    eventKey: (selectedItem.x - 1).toString(),
                },
                {
                    childName: 'Bar-2',
                    target: 'data',
                    mutation: () => ({ style: { fill: theme.primary!, opacity: 0.8 } }),
                    eventKey: (selectedItem.x - 1).toString(),
                },
            ];
        setExternalMutation(newMutation);
    };

    const resetMutation = () => {
        const newMutation = [
            {
                childName: 'Bar-1',
                target: 'data',
                mutation: () => ({
                    style: {
                        fill: theme.background!,
                        opacity: 0.2,
                    }
                }),
                eventKey: `all`,
            },
            {
                childName: 'Bar-2',
                target: 'data',
                mutation: () => ({
                    style: {
                        fill: theme.background!,
                        opacity: 0.8,
                    }
                }),
                eventKey: `all`,
            },
        ];
        setExternalMutation(newMutation);
    };

    // Render loading state
    if (isLoading) {
        return <SkeletonChart height={height} width={width} />;
    }

    // Render empty state
    if (groupedData.length === 0 && !isLoading) {
        if (EmptyComponent) {
            return typeof EmptyComponent === 'function'
                ? EmptyComponent()
                : EmptyComponent;
        }
        return <DefaultEmptyState height={height} width={width} />;
    }

    const max = Math.max(...groupedData.map(item => item.amount));
    const min = groupedData.length === 1 ? 0 : Math.min(...groupedData.map(item => item.amount));

    const formattedGroupBy = typeof groupBy === 'object' ? groupBy.period : groupBy;
    const defaultXAxisFormat = getXAxisFormat(formattedGroupBy);
    const finalXAxisFormat = xAxisFormat || defaultXAxisFormat;

    return (
        <VictoryChart
            height={height}
            width={width}
            theme={VictoryTheme.material}
            style={{ parent: { stroke: 'none' } }}
            externalEventMutations={externalMutation}
            events={[
                {
                    target: 'data',
                    childName: ['Bar-1', 'Bar-2'],
                    eventHandlers: {
                        onPressIn: (event, obj) => {
                            const selectedData = obj.data[obj.index];
                            const newSelected = isEqual(selectedItem, selectedData) ? {} : selectedData;
                            setSelectedItem(newSelected);

                            // Notify parent component with the date of the selected group
                            if (!isEmpty(newSelected)) {
                                handleChange('selectedDate', newSelected.date);
                            } else {
                                handleChange('selectedDate', null);
                            }
                        },
                    },
                },
            ]}
            containerComponent={
                <VictoryZoomContainer disable zoomDomain={zoomDomain} />
            }
        >
            <VictoryAxis
                dependentAxis
                orientation={axisOrientation}
                style={{
                    grid: {
                        stroke: 'rgba(79, 82, 89, 0.3)',
                        strokeDasharray: 'none',
                        strokeWidth: StyleSheet.hairlineWidth,
                    },
                    // tickLabels: { fontSize: 10 },
                    axis: { stroke: 'none', },
                    ticks: { stroke: 'none' },

                }}
                tickCount={max < 100 ? 3 : max < 500 ? 5 : 6}
                tickFormat={x => {

                    return toCurrency(x)
                }}
                domain={[min, max + (max * 0.1)]}
            />
            <VictoryStack>
                <VictoryBar
                    name="Bar-1"
                    style={{
                        data: {
                            fill: theme.background,
                            opacity: 0.2,
                        }
                    }}
                    barWidth={40}
                    data={groupedData}
                    x={'x'}
                    y={'amount'}
                // labelComponent={<VictoryLabel dy={10}
                //     style={{

                //         fontSize: 8,
                //     }}
                // />}
                />
                <VictoryBar
                    name="Bar-2"
                    barWidth={40}
                    style={{
                        data: {
                            fill: theme.background,
                            opacity: 0.8,

                        },

                    }}
                    data={groupedData.map((item) => ({
                        x: item.x,
                        y: max < 100 ? 3 : max < 500 ? 10 : 30

                    }))}
                    x={'x'}
                    y={'y'}

                />
            </VictoryStack>
            <VictoryAxis
                style={{
                    grid: { stroke: 'none' },
                    tickLabels: { fontSize: 12 },
                    axis: { stroke: 'none' },
                    ticks: { stroke: 'none' },
                }}
                tickFormat={(x) => {
                    const dataPoint = groupedData.find(item => item.x === x);
                    if (!dataPoint) return '';
                    return format(dataPoint.date, finalXAxisFormat);
                }}
            />
        </VictoryChart>
    );
};