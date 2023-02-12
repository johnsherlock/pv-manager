import moment from 'moment';
import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerDivProps {
  value: string;
  onClick: () => void;
}

const DatePickerDiv = forwardRef<HTMLDivElement, DatePickerDivProps>(({ value, onClick }, ref) => (
  <div className="custom-date-picker" onClick={onClick} ref={ref}>
    {value}
  </div>
));

interface CustomDatePickerProps {
  selectedDate: moment.Moment;
  onChange: (moment: moment.Moment) => any;
}

const CustomDatePicker = ({ selectedDate, onChange }: CustomDatePickerProps) => {

  return (
    <DatePicker
      selected={selectedDate.toDate()}
      onChange={(date) => { console.log(date); onChange(moment(date)); }}
      placeholderText="Select a date"
      dateFormat="EEE do MMM yyyy"
      minDate={new Date(2023, 0, 20)}
      maxDate={new Date()}
      customInput={<DatePickerDiv value={selectedDate.toString()} onClick={() => {}}/>}
    />
  );
};

export default CustomDatePicker;