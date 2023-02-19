import moment from 'moment';
import * as dateUtils from './date-utils';
import { HourlyUsageData } from './pv-service';

interface AppState {
  today: moment.Moment;
  selectedDate: moment.Moment;
  formattedSelectedDate: string;
  data: Map<string, HourlyUsageData[]>;
  totals: any;
}

export const initialState = (): AppState => {
  const today: moment.Moment = moment().startOf('day');
  return {
    today: today,
    selectedDate: today,
    formattedSelectedDate: dateUtils.formatDate(today),
    data: new Map(),
    totals: {},
  };
};