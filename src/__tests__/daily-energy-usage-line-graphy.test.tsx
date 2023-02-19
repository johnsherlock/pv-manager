import { render } from '@testing-library/react';
import { Line } from 'react-chartjs-2';
import DailyEnergyUsageLineGraph from '../daily-energy-usage-line-graph';

jest.mock('react-chartjs-2', () => ({
  Line: jest.fn(() => null),
}));

describe('DailyEnergyUsageLineGraph', () => {
  it('renders the line graph', () => {
    const data = [
      { hr: 0, imp: 1000000, gep: 2000000, exp: 3000000 },
      { hr: 1, imp: 2000000, gep: 3000000, exp: 4000000 },
      { hr: 2, imp: 3000000, gep: 4000000, exp: 5000000 },
    ];

    render(<DailyEnergyUsageLineGraph data={data} />);

    expect(Line).toHaveBeenCalledTimes(1);
    expect(Line).toHaveBeenCalledWith({
      data: {
        datasets: [
          {
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            data: [
              0.28,
              0.56,
              0.83,
            ],
            fill: false,
            label: 'Imported kWh',
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
          },
          {
            backgroundColor: 'rgba(51, 153, 102, 0.5)',
            borderColor: 'rgb(51, 153, 102)',
            data: [
              0.56,
              0.83,
              1.11,
            ],
            fill: false,
            label: 'Generated kWh',
            pointBackgroundColor: 'rgba(51, 153, 102, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(51, 153, 102, 1)',
          },
          {
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            borderColor: 'rgb(53, 162, 235)',
            data: [
              0.83,
              1.11,
              1.39,
            ],
            fill: false,
            label: 'Exported kWh',
            pointBackgroundColor: 'rgba(53, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
          },
        ],
        labels: [
          '00',
          '01',
          '02',
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hour of Day',
            },
          },
          y: {
            title: {
              display: true,
              text: 'kWh',
            },
          },
        },
      },
    }, {});
  });
});
