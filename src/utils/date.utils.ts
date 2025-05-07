import moment from 'moment';
import { Shift } from '../types/shift.types';

export const formatDate = (date: Date): string => {
    return moment(date).format('YYYY-MM-DD');
};

export const formatMonthYear = (date: Date): string => {
    return moment(date).format('MMMM YYYY');
};

export const groupShiftsByMonth = (shifts: Shift[]): Record<string, Shift[]> => {
    return shifts.reduce((groups, shift) => {
        const monthYear = formatMonthYear(shift.date);
        if (!groups[monthYear]) {
            groups[monthYear] = [];
        }
        groups[monthYear].push(shift);
        return groups;
    }, {} as Record<string, Shift[]>);
};
