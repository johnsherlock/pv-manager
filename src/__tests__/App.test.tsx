import { render } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import App from '../App';
import * as pvService from '../lib/pvService';

jest.mock('./lib/pvService');

describe('App', () => {
  it('renders daily energy usage table and line graph', async () => {
    const data = [{
      generated: 100,
      hourEnding: '2020-01-01T00:00:00',
      cost: 0.12,
    }, {
      generated: 200,
      hourEnding: '2020-01-01T01:00:00',
      cost: 0.24,
    }];

    const totals = [{
      generated: 300,
      cost: 0.36,
    }];

    (pvService.getHourlyUsageDataForDate as jest.Mock).mockResolvedValue(data);

    const { getByText, getByTestId } = render(<App />);

    await wait(() => {
      expect(pvService.getHourlyUsageDataForDate).toHaveBeenCalledWith(moment().format('YYYY-MM-DD'));
    });

    expect(getByText(/100/)).toBeInTheDocument();
    expect(getByText(/0.12/)).toBeInTheDocument();
    expect(getByText(/200/)).toBeInTheDocument();
    expect(getByText(/0.24/)).toBeInTheDocument();
    expect(getByTestId('line-graph')).toBeInTheDocument();
  });
});