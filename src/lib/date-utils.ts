import moment from 'moment';

export const formatDate = (date: moment.Moment): string => moment(date).startOf('day').format('YYYY-MM-DD');

export const dawnOfTime = moment(new Date('2023-01-20')).startOf('day');