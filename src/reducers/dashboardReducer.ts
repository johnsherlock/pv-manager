import { Scale, View } from '../energy-usage-line-graph';

export type DashboardAction =
  | { type: 'SET_SCALE'; payload: Scale }
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SET_DARK_MODE'; payload: boolean };

export interface DashboardState {
  energyUsageLineGraphScale: Scale;
  energyUsageLineGraphView: View;
  darkMode: boolean;
}

export const initialState: DashboardState = {
  energyUsageLineGraphScale: 'hour',
  energyUsageLineGraphView: 'nonCumulative',
  darkMode: false,
};

export const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_SCALE':
      return { ...state, energyUsageLineGraphScale: action.payload };
    case 'SET_VIEW':
      return { ...state, energyUsageLineGraphView: action.payload };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    default:
      return state;
  }
};