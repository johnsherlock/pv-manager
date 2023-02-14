import moment from 'moment';
import * as dateUtils from './date-utils';

interface AppState {
  today: moment.Moment;
  selectedDate: moment.Moment;
  formattedSelectedDate: string;
  data: any;
  totals: any;
}

export const initialState = (): AppState => {
  const today: moment.Moment = moment().startOf('day');
  return {
    today: today,
    selectedDate: today,
    formattedSelectedDate: dateUtils.formatDate(today),
    data: {},
    totals: {},
  };
};