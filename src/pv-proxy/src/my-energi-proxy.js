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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const my_energi_service_1 = require("./my-energi-service");
const username = process.env.MYENERGI_USERNAME;
const password = process.env.MYENERGI_PASSWORD;
const myenergiAPIEndpoint = 'https://director.myenergi.net';
if (!username || !password) {
    throw new Error('MYENERGI_USERNAME and MYENERGI_PASSWORD must be set as environment variables.');
}
const myEnergiService = new my_energi_service_1.MyEnergiService(myenergiAPIEndpoint);
function handler(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const date = event.queryStringParameters.date;
            const data = yield myEnergiService.getEddiData(date, { serialNumber: username, password: password });
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS',
                },
                body: JSON.stringify(data),
            };
        }
        catch (error) {
            console.error(error);
            return { statusCode: 500, body: JSON.stringify({ error }) };
        }
    });
}
exports.handler = handler;
