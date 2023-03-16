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
exports.handler = void 0;
const axios_digest_auth_1 = __importDefault(require("@mhoc/axios-digest-auth"));
const username = process.env.MYENERGI_USERNAME;
const password = process.env.MYENERGI_PASSWORD;
const myenergiAPIEndpoint = 'https://director.myenergi.net';
if (!username || !password) {
    throw new Error('MYENERGI_USERNAME and MYENERGI_PASSWORD must be set as environment variables.');
}
function handler(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const date = event.queryStringParameters.date;
            if (!date) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Missing date parameter' }) };
            }
            const url = `${myenergiAPIEndpoint}/cgi-jdayhour-E21494842-${date}`;
            const digestAuth = new axios_digest_auth_1.default({ password: password, username: username });
            const response = yield digestAuth.request({
                headers: { Accept: 'application/json' },
                method: 'GET',
                url,
            });
            const data = response.data;
            return { statusCode: 200, body: JSON.stringify(data) };
        }
        catch (error) {
            console.error(error);
            return { statusCode: 500, body: JSON.stringify({ error: 'Error fetching data' }) };
        }
    });
}
exports.handler = handler;
