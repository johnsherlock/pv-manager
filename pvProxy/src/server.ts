// server.ts
import AxiosDigestAuth from '@mhoc/axios-digest-auth';
import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());

app.get('/data', (req: any, res: any) => {
  console.log('Fetching data from API...');
  const date = req.query.date;
  if (!date) {
    res.status(400).json({ error: 'Missing date parameter' });
    return;
  }
  const url = `https://director.myenergi.net/cgi-jdayhour-E21494842-${date}`;

  const digestAuth = new AxiosDigestAuth({
    password: 'fRkFSZqsBMIRa2hYkvxgXIz4',
    username: '21494842',
  });

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
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});