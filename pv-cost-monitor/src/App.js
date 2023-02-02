import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'bootswatch/dist/cosmo/bootstrap.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css'
import DailyEnergyUsageLineGraph from './DailyEnergyUsageLineGraph';
import * as numUtils from './lib/numUtils';
import * as costUtils from './lib/costUtils';

const dawnOfTime = moment(new Date("2023-01-20")).startOf('day');

const initialTotals = () => {
  return {
    impTotal: 0,
    genTotal: 0,
    expTotal: 0,
    grossCostTotal: 0,
    grossSavingTotal: 0,
    saturdayNetSavingTotal: 0,
    exportValueTotal: 0,
  }
}

const formatDate = (date) => {
  return moment(date).startOf('day').format("YYYY-MM-DD");
}

const initialState = () => {
  const today = moment().startOf('day');
  return {
    today: today,
    selectedDate: today,
    formattedSelectedDate: formatDate(today),
    data: {},
    totals: {},
  }
}

const App =() => {
  const [state, setState] = useState(initialState());

  useEffect(() => {
    // retrieve data for today.
    getDataForDate(state.selectedDate);
  }, []);

  const recalculateTotals = (data) => {
    console.log('Recaculating totals')
    const totals = data.reduce((totals, item) => {
      totals.impTotal = totals.impTotal + (numUtils.formatDecimal(item.imp) || 0);
      totals.genTotal = totals.genTotal + (numUtils.formatDecimal(item.gep) || 0);
      totals.expTotal = totals.expTotal + (numUtils.formatDecimal(item.exp) || 0);
      totals.grossCostTotal = totals.grossCostTotal + costUtils.calculateHourlyGrossCostIncStdChgAndDiscount(item.hr, item.dow, item.imp);
      totals.grossSavingTotal = totals.grossSavingTotal + costUtils.calculateDiscountedHourlyGrossCost(item.hr, item.dow, item.gep);
      totals.saturdayNetSavingTotal = totals.saturdayNetSavingTotal + costUtils.calculateSaturdaySaving(item.hr, item.dow, item.imp);
      totals.exportValueTotal = totals.exportValueTotal + costUtils.calculateExportValue(item.exp);

      return totals;
    }, initialTotals());
    return totals;
  }

  const getDataForDate = (targetDate) => {
    document.body.style.cursor = 'progress';
    const formattedTargetDate = formatDate(targetDate);
    if (state.data[formattedTargetDate] && targetDate.isBefore(state.today)) {
      console.log(`Data for ${formattedTargetDate} already in cache`);
      setState({
        ...state,
        today: moment().startOf('day'),
        selectedDate: targetDate,
        formattedSelectedDate: formattedTargetDate,
      });
      document.body.style.cursor = 'auto';
    }
    else {
      console.log(`Retrieving data for ${formattedTargetDate}`)
      const url = `http://localhost:3001/data?date=${formattedTargetDate}`;
      axios.get(url)
        .then(response => {
          const selectedDateData = response.data.U21494842;
          const newState = { 
            ...state,
            today: moment().startOf('day'),
            selectedDate: targetDate,
            formattedSelectedDate: formattedTargetDate,
          };
          newState.data[formattedTargetDate] = selectedDateData;
          newState.totals[formattedTargetDate] = recalculateTotals(selectedDateData);
          setState(newState);
          console.log('State set');
          document.body.style.cursor = 'auto';
        })
        .catch(error => {
          console.log('Error retrieving remote data', error);
          document.body.style.cursor = 'auto';
        });    
    }
  }

  const goToPreviousDay = () => {
    getDataForDate(new moment(state.selectedDate.subtract(1, 'day')));
  }

  const goToNextDay = () => {
    getDataForDate(new moment(state.selectedDate.add(1, 'day')));
  }

  const CustomDatePicker = forwardRef(({ value, onClick }, ref) => (
    <div className="custom-date-picker" onClick={onClick} ref={ref}>
      {value}
    </div>
  ));

  return (
    <div className="container grid-container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9">
          <div className="navigation">
            <h1>
              <div className="navPrev">
                {state.selectedDate.isAfter(dawnOfTime) ? <div className="navigationButton" onClick={goToPreviousDay}>&lt;&lt;</div> : null}
              </div>
              <div className="date">
                <DatePicker
                  selected={state.selectedDate.toDate()}
                  onChange={date => { console.log(date); getDataForDate(new moment(date)) }}
                  placeholderText="Select a date"
                  dateFormat="EEE do MMM yyyy"
                  minDate={new Date(2023, 0, 20)}
                  maxDate={new Date()}
                  customInput={<CustomDatePicker />}
                />
              </div>
              <div className="navNext">
                {state.selectedDate.isBefore(state.today) ? <div className="navigationButton" onClick={goToNextDay}>&gt;&gt;</div> : null}
              </div>
            </h1>
          </div>
          <div className="table">
            <div className="table-header">
              <div className="table-row">
                <div className="table-cell">Hour</div>
                <div className="table-cell">Imported kWh</div>
                <div className="table-cell">Cost</div>
                <div className="table-cell">Generated kWh</div>
                <div className="table-cell">Saving</div>
                <div className="table-cell">Exported kWh</div>
                <div className="table-cell">Value</div>
              </div>
            </div>
            <div className="table-container">
              <div className="table-body">
                {state.data[state.formattedSelectedDate]?.map((item, index) => (
                  <div key={item.yr + item.mon + item.dom + item.hr} className={`table-row ${index % 2 === 0 ? 'table-primary' : ''}`}>
                    <div className="table-cell">{item.hr ? item.hr.toString().padStart(2, '0') : "00"}</div>
                    <div className="table-cell">{numUtils.formatDecimal(numUtils.convertJoulesToKwh(item.imp)).toFixed(2)}</div>
                    <div className="table-cell">{costUtils.formatToEuro(costUtils.calculateHourlyGrossCostIncStdChgAndDiscount(item.hr, item.dow, item.imp))}</div>
                    <div className="table-cell">{numUtils.formatDecimal(numUtils.convertJoulesToKwh(item.gep)).toFixed(2)}</div>
                    <div className="table-cell">{costUtils.formatToEuro(costUtils.calculateDiscountedHourlyGrossCost(item.hr, item.dow, item.gep))}</div>
                    <div className="table-cell">{numUtils.formatDecimal(numUtils.convertJoulesToKwh(item.exp)).toFixed(2)}</div>
                    <div className="table-cell">{numUtils.formatDecimal(costUtils.calculateExportValue(item.exp)).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="table-footer">
              <div className="table-row">
                <span className="table-cell">Total</span>
                <span className="table-cell">{numUtils.formatDecimal(numUtils.convertJoulesToKwh(state.totals[state.formattedSelectedDate]?.impTotal))} kWh</span>
                <span className="table-cell">
                  {costUtils.formatToEuro(state.totals[state.formattedSelectedDate]?.grossCostTotal)}&nbsp;
                  {state.totals[state.formattedSelectedDate]?.saturdayNetSavingTotal ? `(${costUtils.formatToEuro(costUtils.calculateDiscountedGrossCostExcludingStdChg(state.totals[state.formattedSelectedDate]?.saturdayNetSavingTotal))})` : ''}
                </span>
                <span className="table-cell">{numUtils.formatDecimal(numUtils.convertJoulesToKwh(state.totals[state.formattedSelectedDate]?.genTotal))} kWh</span>
                <span className="table-cell">{costUtils.formatToEuro(state.totals[state.formattedSelectedDate]?.grossSavingTotal) || '€0.00'}</span>
                <span className="table-cell">{numUtils.formatDecimal(numUtils.convertJoulesToKwh(state.totals[state.formattedSelectedDate]?.expTotal))} kWh</span>
                <span className="table-cell">{costUtils.formatToEuro(state.totals[state.formattedSelectedDate]?.exportValueTotal) || '€0.00'}</span>
              </div>
            </div>
          </div>
          <div className="chart">
            <DailyEnergyUsageLineGraph data={state.data[state.formattedSelectedDate] || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
