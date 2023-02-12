"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_digest_auth_1 = __importDefault(require("@mhoc/axios-digest-auth"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
class Server {
    constructor(username, password) {
        this.app = (0, express_1.default)();
        this.myenergiAPIEndpoint = 'https://director.myenergi.net';
        this.username = username;
        this.password = password;
        this.app.use((0, cors_1.default)());
        this.app.get('/hour-data', (req, res) => {
            const date = req.query.date;
            const url = `${this.myenergiAPIEndpoint}/cgi-jdayhour-E21494842-${date}`;
            return this.fetchData(date, url, res);
        });
        this.app.get('/minute-data', (req, res) => {
            const date = req.query.date;
            const url = `${this.myenergiAPIEndpoint}/cgi-jday-E21494842-${date}`;
            return this.fetchData(date, url, res);
        });
        this.app.listen(3001, () => {
            console.log('Server started on port 3001');
        });
    }
    fetchData(date, url, res) {
        console.log('Fetching data from API...');
        if (!date) {
            res.status(400).json({ error: 'Missing date parameter' });
            return;
        }
        const digestAuth = new axios_digest_auth_1.default({ password: this.password, username: this.username });
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
    throw ('MYENERGI_USERNAME and MYENERGI_PASSWORD must be set as environment variables.');
}
else {
    new Server(_username, _password);
}
