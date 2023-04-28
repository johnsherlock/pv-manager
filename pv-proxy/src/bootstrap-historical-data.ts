import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { parallelLimit } from 'async';
import moment from 'moment';
import { getHttpResult } from './http-utils';

const lambda = new LambdaClient({ region: 'eu-west-1' });

const dailyBackupLambda = process.env.MYENERGI_DAILY_BACKUP_LAMBDA ?? 'MyEnergiDailyBackup';

export const sequentialHandler = async (event: any, context: any) => {
  let consecutiveFailures = 0;
  let date = moment().subtract(1, 'days').startOf('day'); // yesterday's date

  let count = 0;

  while (count < 10) {
    const dateString = date.format('YYYY-MM-DD');
    console.log(`Invoking ${dailyBackupLambda} with date: ${dateString}`);
    const payload = { date: dateString };

    const command = new InvokeCommand({
      FunctionName: dailyBackupLambda,
      Payload: Buffer.from(JSON.stringify(payload), 'utf8'),
    });

    try {
      const response = await lambda.send(command);
      const statusCode = response.StatusCode;

      if (!statusCode) {
        console.log('No status code returned');
        break;
      } else if (statusCode === 200) {
        console.log(`Successfully invoked ${dailyBackupLambda} for date ${dateString}`);
        consecutiveFailures = 0; // reset consecutive failures counter
      } else if (statusCode === 404 || statusCode >= 500) {
        console.log(`Failure invoking ${dailyBackupLambda} for date ${dateString}:`, statusCode);
        consecutiveFailures++;
      } else {
        // unexpected status code
        console.log(`Unexpected status code: ${statusCode}`);
        break;
      }
    } catch (error) {
      console.log(`Error invoking ${dailyBackupLambda}: ${error}`);
      consecutiveFailures++;
    }

    date = date.subtract(1, 'days').startOf('day'); // decrement by one day
    count++;
  }

  if (consecutiveFailures >= 10) {
    const error = `Stopped after receiving ${consecutiveFailures} consecutive failures`;
    console.error(error);
    return getHttpResult(500, error);
  }
  return getHttpResult(200, 'Success');
};

export const handler = async (event: any, context: any) => {
  let totalFailures = 0;
  let date = moment().subtract(1, 'days').startOf('day'); // yesterday's date

  let count = 0;

  while (totalFailures < 10 && count < 20) {
    const results = await new Promise<any>((resolve) => {
      const tasks = [];
      for (let i = 0; i < 10; i++) {
        const dateString = date.format('YYYY-MM-DD');
        const payload = { date: dateString };

        const command = new InvokeCommand({
          FunctionName: dailyBackupLambda,
          Payload: Buffer.from(JSON.stringify(payload), 'utf8'),
        });

        tasks.push(async () => {
          try {
            const response = await lambda.send(command);
            const statusCode = response.StatusCode;

            if (!statusCode) {
              console.log('No status code returned');
              return 'no-status-code';
            } else if (statusCode === 200) {
              return 'success';
            } else if (statusCode === 404 || statusCode >= 500) {
              return 'failure';
            } else {
              // unexpected status code
              console.log(`Unexpected status code: ${statusCode}`);
              return 'unexpected-status-code';
            }
          } catch (error) {
            console.log(`Error invoking ${dailyBackupLambda}: ${error}`);
            return 'error';
          }
        });
        date = date.subtract(1, 'days').startOf('day'); // decrement by one day
        count++;
      }

      parallelLimit(tasks, 10, (err, data) => {
        if (err) {
          console.log(`Error invoking ${dailyBackupLambda} for date ${date}: ${err}`);
          resolve([]);
        } else {
          resolve(data);
        }
      });
    });

    const successes = results.filter((result: string) => result === 'success').length;
    const failures = results.filter((result: string) => result === 'failure' || result === 'error').length;

    totalFailures += failures;

    console.log(`Batch completed with ${successes} successes and ${failures} failures`);

    if (failures === 10) {
      console.log('Stopped after receiving 10 consecutive failures');
      return getHttpResult(500, `Stopped after receiving ${totalFailures} failures`);
    }
  }

  console.log(`Stopped after receiving ${totalFailures} failures and a count of ${count}`);

  return getHttpResult(200, 'Success');
};