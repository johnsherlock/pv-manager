import { render } from '@testing-library/react';
import moment from 'moment-timezone';
import React from 'react';
import CustomDatePicker from '../custom-date-picker';

describe('CustomDatePicker', () => {
  test('renders correctly', () => {
    const selectedDate = moment('2023-02-19');
    const onChange = jest.fn();
    const { container } = render(<CustomDatePicker selectedDate={selectedDate} onChange={onChange} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});