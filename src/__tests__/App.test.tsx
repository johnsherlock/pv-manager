import { render, act, waitFor } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import App from '../App';
import * as pvService from '../lib/pvService';

jest.mock('../lib/pvService', () => ({
  getHourlyUsageDataForDate: jest.fn().mockResolvedValue([
    { yr: 2023, mon: 1, dom: 31, imp: 1895904, gen: 7190, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 1, imp: 2525323, gen: 5515, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 2, imp: 2374196, gen: 5450, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 3, imp: 713464, gen: 7194, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 4, imp: 624580, gen: 7128, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 5, imp: 814572, gen: 7132, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 6, imp: 961806, gen: 7130, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 7, imp: 1425098, gen: 6830, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 8, imp: 777800, gep: 163361, gen: 418, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 9, imp: 352502, exp: 9228, gep: 2975205, h1d: 1369453, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 10, imp: 2456, exp: 3243905, gep: 5228174, h1d: 755088, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 11, imp: 240, exp: 2295689, gep: 5539054, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 12, imp: 118025, exp: 626416, gep: 4886050, h1d: 819404, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 13, imp: 1586995, exp: 1094158, gep: 3223278, h1d: 561517, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 14, imp: 323686, exp: 592778, gep: 1879584, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 15, imp: 669287, gep: 568353, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 16, imp: 1937473, gep: 149025, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 17, imp: 2892321, gep: 417, gen: 6352, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 18, imp: 7396867, gen: 7009, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 19, imp: 4440413, gen: 7134, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 20, imp: 2614509, gen: 7127, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 21, imp: 3651589, gen: 5692, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 22, imp: 2843383, gen: 6830, dow: 'Tue' },
    { yr: 2023, mon: 1, dom: 31, hr: 23, imp: 2768714, gen: 6950, dow: 'Tue' },
  ]),
}));

const mockMoment = moment('2023-02-13');

jest.mock('../lib/costUtils', () => ({
  initialState: jest.fn().mockReturnValue({
    today: mockMoment,
    selectedDate: mockMoment,
    formattedSelectedDate: '2023-02-13',
    data: [],
    totals: [],
  }),
}));

jest.mock('../lib/dateUtils', () => ({
  ...jest.requireActual('../lib/dateUtils'),
  formatDate: jest.fn().mockReturnValue('2023-02-13'),
}));

jest.mock('../lib/costUtils', () => ({
  recalculateTotals: jest.fn(),
}));

jest.mock('../CustomDatePicker', () => () => <div data-testid="CustomDatePicker-mock" />);
jest.mock('../DailyEnergyUsageLineGraph', () => () => <div data-testid="DailyEnergyUsageLineGraph-mock" />);
jest.mock('../DailyEnergyUsageTable', () => () => <div data-testid="DailyEnergyUsageTable-mock" />);

describe('App', () => {
  it('renders correctly', async () => {
    const selectedDate = moment().subtract(1, 'day');
    const formattedSelectedDate = selectedDate.format('YYYY-MM-DD');

    let renderResult: any;
    await act(async () => {
      renderResult = render(<App />);
    });

    await waitFor(() => {
      expect(pvService.getHourlyUsageDataForDate).toHaveBeenCalledWith(formattedSelectedDate);
    });

    expect(renderResult!.asFragment()).toMatchSnapshot();
  });
});
