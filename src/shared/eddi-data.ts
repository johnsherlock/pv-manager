/**
 * gep: Generated Positive -- the energy generated by the solar panels
 * gen: Generated Negative -- the excess energy generated by the solar panels
 * h1d: heater-1 diverted -- the energy diverted from the panels to the immersion
 * h1b: heater-1 boost -- the energy being sent to the immersion due to boost (could come from gird)
 * imp: Imported -- the energy imported from the grid
 * exp: Exported -- the energy exported to the grid
 * pectn:Positive Energy CT-n -- the energy being consumed by the house
 * nectn: Negative Energy CT-n -- the excess energy being generated by the solar panels (how is this different to `gen`)
 * v1:Supply Voltage (centi-volts) -- the volatage of electricity being fed back to the grid. Should be between 240-250
 * frq:Supply Frequency (centi-Hertz) -- the AC frequency of the elecricity being fed back to the grid. Should be between 49-51Hz
*/
export interface EddiData {
  yr: number;
  mon: number;
  dom: number;
  dow: 'Sun' | 'Mon' | 'Tues' | 'Wed' | 'Thurs' | 'Fri' | 'Sat';
  hr?: number;
  min?: number;
  imp?: number;
  gep?: number;
  exp?: number;
  h1d?: number;
  h1b?: number;
  pect1?: number;
  pect2?: number;
  hsk?: number;
  v1?: number;
  frq?: number;
}