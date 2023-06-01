import { DynamoDB } from 'aws-sdk';
import { Totals } from '../shared/pv-data';

const dynamo = new DynamoDB.DocumentClient();

const tableName = 'eddi-data';

async function queryData(serialNumber: string, startDate: string, endDate: string): Promise<Totals[]> {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: tableName,
    KeyConditionExpression: 'serialNumber = :serialNumber AND #date BETWEEN :startDate AND :endDate',
    ExpressionAttributeNames: {
      '#date': 'date',
    },
    ExpressionAttributeValues: {
      ':serialNumber': serialNumber,
      ':startDate': startDate,
      ':endDate': endDate,
    },
  };

  console.log('Querying dynamo with payload', params);

  const response = await dynamo.query(params).promise();

  // Parse the data field from a string to a JSON object
  return response.Items?.map(item => {
    const dataRecord: Totals = JSON.parse(item.data);
    return dataRecord;
  }) as Totals[];
}

export const handler = async (event: any, context: any) => {
  if (!event.queryStringParameters) {
    return { statusCode: 400, body: 'Missing required query parameters' };
  }

  const { serialNumber, startDate, endDate } = event.queryStringParameters;

  if (!serialNumber || !startDate || !endDate) {
    return { statusCode: 400, body: 'Missing required query parameters' };
  }

  try {
    console.log(`Aggregating Eddi data for serial number ${serialNumber} in range ${startDate} - ${endDate}`);

    const dataRecords = await queryData(serialNumber, startDate, endDate);

    console.log('Data', dataRecords);

    const aggregatedData: Totals = dataRecords.reduce((acc: Totals, record: Totals) => {
      for (const key in acc) {
        acc[key as keyof Totals] += record[key as keyof Totals];
      }
      return acc;
    }, {
      genTotal: 0,
      expTotal: 0,
      conpTotal: 0,
      dayImpTotal: 0,
      peakImpTotal: 0,
      nightImpTotal: 0,
      combinedImpTotal: 0,
      freeImpTotal: 0,
      immersionRunTime: 0,
      immersionTotal: 0,
      grossSavingTotal: 0,
    });

    console.log('Aggregated data', aggregatedData);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({
        rawData: dataRecords,
        aggregatedData,
      }),
    };
  } catch (error) {
    console.error('Error querying data', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
};
