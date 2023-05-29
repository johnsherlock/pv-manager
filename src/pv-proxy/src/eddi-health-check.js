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
const http_utils_1 = require("./http-utils");
const my_energi_service_1 = require("./my-energi-service");
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailRecipient = process.env.EMAIL_RECIPIENT;
const sesSmtpConfig = {
    username: process.env.SES_SMTP_USERNAME,
    password: process.env.SES_SMTP_PASSWORD,
    region: process.env.AWS_REGION,
};
const username = process.env.MYENERGI_USERNAME;
const password = process.env.MYENERGI_PASSWORD;
const myenergiAPIEndpoint = 'https://director.myenergi.net';
if (!username || !password) {
    throw new Error('MYENERGI_USERNAME and MYENERGI_PASSWORD must be set as environment variables.');
}
const myEnergiService = new my_energi_service_1.MyEnergiService(myenergiAPIEndpoint);
const sendEmail = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: `email-smtp.${sesSmtpConfig.region}.amazonaws.com`,
        port: 587,
        secure: false,
        auth: {
            user: sesSmtpConfig.username,
            pass: sesSmtpConfig.password,
        },
    });
    const mailOptions = {
        from: 'you@example.com',
        to: emailRecipient,
        subject: 'System Offline',
        text: 'The system is currently offline as no data is returned from the queried endpoint.',
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
    }
    catch (error) {
        console.error(`Error sending email: ${error}`);
    }
});
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get today's date in the format YYYY-MM-DD
        const date = new Date().toISOString().split('T')[0];
        const data = yield myEnergiService.getEddiData(date, { serialNumber: username, password: password });
        // if no data is returned, send an email to the user
        if (!data || data.length === 0) {
            const message = `No data returned for ${date}. MyEnergi diverter may be offline or the API offline.`;
            console.log(message);
            // send an email to the user using nodemailer
            yield sendEmail(message);
        }
    }
    catch (error) {
        const msg = `Error fetching data from MyEnergi API: ${error}`;
        return (0, http_utils_1.getHttpResult)(500, msg);
    }
});
exports.handler = handler;
