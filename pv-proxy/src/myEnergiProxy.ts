import AxiosDigestAuth from '@mhoc/axios-digest-auth';

const username = process.env.MYENERGI_USERNAME;
const password = process.env.MYENERGI_PASSWORD;
const myenergiAPIEndpoint = 'https://director.myenergi.net';

if (!username || !password) {
  throw new Error('MYENERGI_USERNAME and MYENERGI_PASSWORD must be set as environment variables.');
}

export async function handler(event: any, context: any) {
  try {
    const date = event.queryStringParameters.date;
    if (!date) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing date parameter' }) };
    }

    const url = `${myenergiAPIEndpoint}/cgi-jday-E21494842-${date}`;

    const digestAuth = new AxiosDigestAuth({ password: password!, username: username! });

    const response = await digestAuth.request({
      headers: { Accept: 'application/json' },
      method: 'GET',
      url,
    });

    const data = response.data;
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
    return { statusCode: 500, body: JSON.stringify({ error: 'Error fetching data' }) };
  }
}
