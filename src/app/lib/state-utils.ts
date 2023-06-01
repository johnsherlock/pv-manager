import moment from 'moment';
import * as dateUtils from './date-utils';
import { MinutePVData, Totals } from '../../shared/pv-data';
import { Scale, View } from '../energy-usage-line-graph';

export type CalendarScale = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface FormattedDateRange { startDate: string; endDate: string };
export interface DateRange { startDate: moment.Moment; endDate: moment.Moment };

export interface AppState {
  intervalId?: number | null;
  today: moment.Moment;
  selectedDate: moment.Moment;
  startDate?: moment.Moment;
  endDate?: moment.Moment | null;
  formattedSelectedDate: string;
  pvDataCache: Map<string, MinutePVData[]>;
  totalsCache: Map<string, Totals[]>;
  energyUsageLineGraphScale: Scale;
  energyUsageLineGraphView: View;
  calendarScale: CalendarScale;
}

export const initialState = (): AppState => {
  const today: moment.Moment = moment().startOf('day');
  return {
    today: today,
    selectedDate: today,
    formattedSelectedDate: dateUtils.formatDate(today),
    pvDataCache: new Map(),
    totalsCache: new Map(),
    energyUsageLineGraphScale: 'hour',
    energyUsageLineGraphView: 'line',
    calendarScale: 'day',
  };
};