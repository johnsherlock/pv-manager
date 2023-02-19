import { render } from '@testing-library/react';
import DailyEnergyUsageTable from '../daily-energy-usage-table';
import { EnergyCalculator } from '../lib/energy-calculator';

jest.mock('../lib/energy-calculator', () => {
  return {
    EnergyCalculator: jest.fn().mockImplementation(() => {
      return {
        recalculateTotals: jest.fn().mockReturnValue(10),
        calculateHourlyGrossCostIncStdChgAndDiscount: jest.fn().mockReturnValue(20),
        calculateDiscountedHourlyGrossCost: jest.fn().mockReturnValue(30),
        calculateExportValue: jest.fn().mockReturnValue(40),
        calculateDiscountedGrossCostExcludingStdChg: jest.fn().mockReturnValue(50),
      };
    }),
  };
});

jest.mock('../lib/num-utils', () => ({
  convertJoulesToKwh: jest.fn(),
  formatToEuro: jest.fn(),
}));

describe('DailyEnergyUsageTable', () => {
  it('renders correctly', () => {
    const data = [{ yr: 2023, mon: 2, dom: 19, hr: 1, imp: 1000, dow: 5, gep: 2000, exp: 500 }];

    const totals = {
      impTotal: 1000,
      grossCostTotal: 50,
      saturdayNetSavingTotal: 10,
      genTotal: 2000,
      grossSavingTotal: 20,
      expTotal: 500,
      exportValueTotal: 25,
    };

    const energyCalculator = new EnergyCalculator({
      dayRate: 0.4673,
      peakRate: 0.5709,
      nightRate: 0.3434,
      exportRate: 0.1850,
      discountPercentage: 0.15,
      standingCharge: 0.7066,
    });

    const component = render(
      <DailyEnergyUsageTable
        data={data}
        totals={totals}
        energyCalculator={energyCalculator}
      />);
    expect(component).toMatchSnapshot();
  });
});
