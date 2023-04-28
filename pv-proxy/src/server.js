"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const my_energi_service_1 = require("./my-energi-service");
class Server {
    constructor(username, password) {
        this.app = (0, express_1.default)();
        this.myEnergiAPIEndpoint = 'https://director.myenergi.net';
        this.username = username;
        this.password = password;
        this.myEnergiService = new my_energi_service_1.MyEnergiService(this.myEnergiAPIEndpoint);
        this.app.use((0, cors_1.default)());
        this.app.get('/minute-data', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const date = req.query.date;
            return yield this.fetchData(date, res);
        }));
        this.app.listen(3001, () => {
            console.log('Server started on port 3001');
        });
    }
    fetchData(date, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching data from API...');
            try {
                const data = yield this.myEnergiService.getEddiData(date, { serialNumber: this.username, password: this.password });
                console.log('Data fetched successfully.');
                res.json(data);
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ error });
            }
        });
    }
}
const username = process.env.MYENERGI_USERNAME;
const password = process.env.MYENERGI_PASSWORD;
if (!username || !password) {
    throw ('MYENERGI_USERNAME and MYENERGI_PASSWORD must be set as environment variables.');
}
else {
    new Server(username, password);
}
