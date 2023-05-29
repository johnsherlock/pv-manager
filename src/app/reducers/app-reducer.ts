import moment from 'moment';
import { MinutePVData } from '../../shared/pv-data';
import { Scale, View } from '../energy-usage-line-graph';
import { AppState, CalendarScale } from '../lib/state-utils';


export type Action =
  | { type: 'SET_SCALE'; payload: Scale }
  | { type: 'SET_CALENDAR_SCALE'; payload: CalendarScale }
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'GO_TO_CACHED_DAY'; payload: { selectedDate: moment.Moment; formattedSelectedDate: string } }
  | { type: 'GO_TO_DAY'; payload: { pvData: MinutePVData[]; selectedDate: moment.Moment; formattedSelectedDate: string } };

export const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_SCALE':
      return { ...state, energyUsageLineGraphScale: action.payload };
    case 'SET_CALENDAR_SCALE':
      return { ...state, calendarScale: action.payload };
    case 'SET_VIEW':
      return { ...state, energyUsageLineGraphView: action.payload };
    case 'GO_TO_CACHED_DAY':
      return {
        ...state,
        today: moment().startOf('day'),
        selectedDate: action.payload.selectedDate,
        formattedSelectedDate: action.payload.formattedSelectedDate,
      };
    case 'GO_TO_DAY':
      const newState = {
        ...state,
        today: moment().startOf('day'),
        selectedDate: action.payload.selectedDate,
        formattedSelectedDate: action.payload.formattedSelectedDate,
        intervalId: null,
      };
      newState.pvDataCache.set(action.payload.formattedSelectedDate, action.payload.pvData);
      return newState;
    default:
      return state;
  }
};