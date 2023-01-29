import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'bootswatch/dist/cosmo/bootstrap.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

const today = moment().startOf('day');
const dawnOfTime = moment(new Date("2023-01-20")).startOf('day');

const dayRate = 0.4330;
const peakRate = 0.5289;
const nightRate = 0.3182;
const exportRate = 0.1850;

function App() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [impTotal, setImpTotal] = useState(0);
  const [genTotal, setGenTotal] = useState(0);
  const [expTotal, setExpTotal] = useState(0);
  const [totalNetCost, setTotalNetCost] = useState(0);
  const [totalNetSaving, setTotalNetSaving] = useState(0);
  const [saturdayNetSaving, setSaturdayNetSaving] = useState(0);
  const [totalNetExportValue, setTotalExportValue] = useState(0);

  useEffect(() => {
    const targetDate = moment(selectedDate).format("YYYY-MM-DD");
    console.log(`Retrieving data for ${targetDate}`)
    const url = `http://localhost:3001/data?date=${targetDate}`;
    axios.get(url)
      .then(response => {
        const data = response.data.U21494842;
        setData(data);
      })
      .catch(error => {
        console.log(error);
      });
  }, [selectedDate]);

  useEffect(() => {
    console.log('Recaculating totals')
    setImpTotal(data.reduce((acc, item) => acc + (formatDecimal(item.imp) || 0), 0));
    setGenTotal(data.reduce((acc, item) => acc + (formatDecimal(item.gep) || 0), 0));
    setExpTotal(data.reduce((acc, item) => acc + (formatDecimal(item.exp) || 0), 0));
    setTotalNetCost(data.reduce((acc, item) => acc + calculateCost(item.hr, item.dow, item.imp), 0));
    setTotalNetSaving(data.reduce((acc, item) => acc + calculateCost(item.hr, item.dow, item.gep), 0));
    setSaturdayNetSaving(data.reduce((acc, item) => acc + calculateSaturdaySaving(item.hr, item.dow, item.imp), 0));
    setTotalExportValue(data.reduce((acc, item) => acc + calculateExportValue(item.exp), 0));
  }, [data]);

  const convertJoulesToKwh = joules => joules ? (joules / 3600000) : '';
  const formatDecimal = number => Math.round(number * 100) / 100;

  const calculateCost = (hour = 0, dow, joules) => {
    if (joules) {
      let multiplier = dayRate;

      if ((hour >= 0 && hour <= 8) || hour === 23) {
        multiplier = nightRate;
      } else if (hour >= 17 && hour <= 19) {
        multiplier = peakRate;
      }

      if (dow === 'Sat' && hour >= 8 && hour <= 17) {
        multiplier = 0;
      }

      const kWh = convertJoulesToKwh(joules);
      const cost = kWh * multiplier;

      return formatDecimal(cost);
    }
    return 0;
  }

  const calculateSaturdaySaving = (hour = 0, dow, joules) => {
    if (joules && dow === 'Sat' && hour >= 9 && hour <= 17) {
      const kWh = convertJoulesToKwh(joules);
      const cost = kWh * dayRate;
      return formatDecimal(cost);
    } else {
      return 0;
    }
  }

  const calculateExportValue = (joules) => {
    if (joules) {
      const kWh = convertJoulesToKwh(joules);
      return formatDecimal(kWh * exportRate);
    } else {
      return 0;
    }
  }

  const formatToEuro = (amount) => {
    return amount ? `€${amount.toFixed(2)}` : '';
  }

  const goToPreviousDay = () => {
    setSelectedDate(new moment(selectedDate.subtract(1, 'day')).startOf('day'));
  }

  const goToNextDay = () => {
    setSelectedDate(new moment(selectedDate.add(1, 'day')).startOf('day'));
  }

  const calculateGrossCost = (netCost) => {

    const discount = 1 - 0.15;
    const vatRate = 1.09;

    const grossCost = (netCost * discount) * vatRate;

    return formatDecimal(grossCost);
  }

  const calculateGrossCostIncStandingCharges = (netCost) => {

    const discount = 1 - 0.15;
    const standingCharge = 0.7704;
    const vatRate = 1.09;

    const grossCost = ((netCost * discount) + standingCharge) * vatRate;

    return formatDecimal(grossCost);
  }


  const CustomDatePicker = forwardRef(({ value, onClick }, ref) => (
    <div className="custom-date-picker" onClick={onClick} ref={ref}>
      {value}
    </div>
  ));

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const LineGraph = ({ data }) => {
    console.log(`Rendering line graph for ${data[0]?.dom}/${data[0]?.mon}/${data[0]?.yr}`);
    const lineData = {
      labels: data.map(item => item.hr ? item.hr.toString().padStart(2, '0') : "00"),
      datasets: [
        {
          label: 'Imported kWh',
          data: data.map(item => convertJoulesToKwh(item.imp)),
          fill: false,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
        },
        {
          label: 'Generated kWh',
          data: data.map(item => convertJoulesToKwh(item.gep)),
          fill: false,
          borderColor: 'rgb(51, 153, 102)',
          backgroundColor: 'rgba(51, 153, 102, 0.5)',
          pointBackgroundColor: 'rgba(51, 153, 102, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(51, 153, 102, 1)'
        },
        {
          label: 'Exported kWh',
          data: data.map(item => convertJoulesToKwh(item.exp)),
          fill: false,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          pointBackgroundColor: 'rgba(53, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
        },
      ]
    };

    const options = {
      scales: {
        y: {
          title: { display: true, text: 'kWh' }
        },
        x: {
          title: { display: true, text: 'Hour of Day' }
        }
      },
    };

    return (
      <Line options={options} data={lineData}/>
    );
  }

  return (
    <div className="container grid-container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <div className="navigation">
            <h1>
              <div className="navPrev">
                {selectedDate.isAfter(dawnOfTime) ? <div className="navigationButton" onClick={goToPreviousDay}>&lt;&lt;</div> : null}
              </div>
              <div className="date">
                <DatePicker
                  selected={selectedDate.toDate()}
                  onChange={date => setSelectedDate(new moment(date).startOf('day'))}
                  placeholderText="Select a date"
                  dateFormat="EEE Do MMM yyyy"
                  minDate={new Date(2023, 0, 20)}
                  maxDate={new Date()}
                  customInput={<CustomDatePicker />}
                />
              </div>
              <div className="navNext">
                {selectedDate.isBefore(today) ? <div className="navigationButton" onClick={goToNextDay}>&gt;&gt;</div> : null}
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
                {data.map((item, index) => (
                  <div key={item.yr + item.mon + item.dom + item.hr} className={`table-row ${index % 2 === 0 ? 'table-primary' : ''}`}>
                    <div className="table-cell">{item.hr ? item.hr.toString().padStart(2, '0') : "00"}</div>
                    <div className="table-cell">{formatDecimal(convertJoulesToKwh(item.imp)).toFixed(2)}</div>
                    <div className="table-cell">{formatToEuro(calculateCost(item.hr, item.dow, item.imp))}</div>
                    <div className="table-cell">{formatDecimal(convertJoulesToKwh(item.gep)).toFixed(2)}</div>
                    <div className="table-cell">{formatToEuro(calculateCost(item.hr, item.dow, item.gep))}</div>
                    <div className="table-cell">{formatDecimal(convertJoulesToKwh(item.exp)).toFixed(2)}</div>
                    <div className="table-cell">{formatDecimal(calculateExportValue(item.exp)).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="table-footer">
              <div className="table-row">
                <span className="table-cell">Total</span>
                <span className="table-cell">{formatDecimal(convertJoulesToKwh(impTotal))}</span>
                <span className="table-cell">
                  {formatToEuro(calculateGrossCostIncStandingCharges(totalNetCost))}&nbsp;
                  {saturdayNetSaving ? `(${formatToEuro(calculateGrossCost(saturdayNetSaving))})` : ''}
                </span>
                <span className="table-cell">{formatDecimal(convertJoulesToKwh(genTotal))}</span>
                <span className="table-cell">{formatToEuro(calculateGrossCost(totalNetSaving)) || '€0.00'}</span>
                <span className="table-cell">{formatDecimal(convertJoulesToKwh(expTotal))}</span>
                <span className="table-cell">{formatToEuro(totalNetExportValue) || '€0.00'}</span>
              </div>
            </div>
          </div>
          <div className="chart">
            <LineGraph data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
