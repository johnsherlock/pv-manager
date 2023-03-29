import moment from 'moment-timezone';
import { BasePVData } from '../model/pv-data';

export const formatDate = (date: moment.Moment): string => moment(date).startOf('day').format('YYYY-MM-DD');

export const dawnOfTime = moment(new Date('2023-01-20')).startOf('day');

export const toMoment = (pvData: BasePVData, locale?: string): moment.Moment => {
  return moment({
    year: pvData.year,
    month: pvData.month - 1,
    date: pvData.dayOfMonth,
    hour: pvData.hour,
    minute: pvData.minute,
  });
};

export const getFormattedTime = (pvData: BasePVData, locale?: string): string => {
  const time = toMoment(pvData, locale);
  return time.format('HH:mm');
};