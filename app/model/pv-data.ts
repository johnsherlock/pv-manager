export interface BasePVData {
  year: number;
  month: number;
  dayOfMonth: number;
  dayOfWeek: 'Sun' | 'Mon' | 'Tues' | 'Wed' | 'Thurs' | 'Fri' | 'Sat';
  hour: number;
  minute: number;
  greenEnergyPercentage: number;
}

export interface MinutePVData extends BasePVData {
  importedJoules: number;
  generatedJoules: number;
  exportedJoules: number;
  immersionDivertedJoules: number;
  immersionBoostedJoules: number;
  consumedJoules: number;
}

export interface HalfHourlyPVData extends BasePVData {
  minute: 0 | 30;
  importedKwH: number;
  generatedKwH: number;
  exportedKwH: number;
  immersionDivertedKwH: number;
  immersionBoostedKwH: number;
  immersionDivertedMins: number;
  immersionBoostedMins: number;
  consumedKwH: number;
}

export interface HourlyPVData extends HalfHourlyPVData {
  minute: 0;
};