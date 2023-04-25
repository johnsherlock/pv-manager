import { DynamoDB } from 'aws-sdk';

import { MyEnergiService } from './myEnergiService';

const username = process.env.MYENERGI_USERNAME;
const password = process.env.MYENERGI_PASSWORD;
const tableName = process.env.EDDI_DATA_TABLE_NAME ?? 'PVData';
const myenergiAPIEndpoint = 'https://director.myenergi.net';

if (!username || !password) {
  throw new Error('MYENERGI_USERNAME and MYENERGI_PASSWORD must be set as environment variables.');
}

const myEnergiService = new MyEnergiService(myenergiAPIEndpoint);

export async function handler(event: any, context: any) {
  try {

    const dynamo = new DynamoDB();

    let date = event.queryStringParameters.date;

    // if date is not provided, use yesterday's date in the format YYYY-MM-DD
    if (!date) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      date = yesterday.toISOString().split('T')[0];
    }

    const data = await myEnergiService.getEddiData(date, { serialNumber: username, password: password });

    // update dynamo entry for "serialNumber" with "data" for "date"
    await dynamo.putItem({
      TableName: tableName,
      Item: {
        serialNumber: { S: username },
        date: { S: date },
        data: { S: JSON.stringify(data) },
      },
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
}
