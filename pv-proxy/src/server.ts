import AxiosDigestAuth from '@mhoc/axios-digest-auth';
import cors from 'cors';
import express from 'express';

class Server {
  private app = express();
  private username: string;
  private password: string;

  private myenergiAPIEndpoint = 'https://director.myenergi.net';

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;

    this.app.use(cors());

    this.app.get('/hour-data', (req: any, res: any): any => {
      const date = req.query.date;
      const url = `${this.myenergiAPIEndpoint}/cgi-jdayhour-E21494842-${date}`;
      return this.fetchData(date, url, res);
    });
    
    this.app.get('/minute-data', (req: any, res: any): any => {
      const date = req.query.date;
      const url = `${this.myenergiAPIEndpoint}/cgi-jday-E21494842-${date}`;
      return this.fetchData(date, url, res);
    });

    this.app.listen(3001, () => {
      console.log('Server started on port 3001');
    });
  }

  private fetchData(date: string, url: string, res: any): any {
    console.log('Fetching data from API...');
    if (!date) {
      res.status(400).json({ error: 'Missing date parameter' });
      return;
    }

    const digestAuth = new AxiosDigestAuth({ password: this.password, username: this.username });

    digestAuth.request({
      headers: { Accept: 'application/json' },
      method: 'GET',
      url,
    })
      .then(response => {
        const data = response.data;
        res.json(data);
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ error: 'Error fetching data' });
      });
  }
}

const _username = process.env.MYENERGI_USERNAME;
const _password = process.env.MYENERGI_PASSWORD;

if (!_username || !_password) {
  throw('MYENERGI_USERNAME and MYENERGI_PASSWORD must be set as environment variables.');
} else {
  new Server(_username, _password);
}