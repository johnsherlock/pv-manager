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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_lambda_1 = require("@aws-sdk/client-lambda");
const async_1 = require("async");
const moment_1 = __importDefault(require("moment"));
const http_utils_1 = require("./http-utils");
const lambda = new client_lambda_1.LambdaClient({ region: 'eu-west-1' });
const dailyBackupLambda = (_a = process.env.MYENERGI_DAILY_BACKUP_LAMBDA) !== null && _a !== void 0 ? _a : 'MyEnergiDailyBackup';
const batchInvokeLambda = (dates) => __awaiter(void 0, void 0, void 0, function* () {
    const batchResponse = {
        successDates: [],
        notFoundDates: [],
        throttledDates: [],
        errorDates: [],
    };
    const results = yield new Promise((resolve) => {
        const tasks = [];
        for (let i = 0; i < dates.length; i++) {
            const dateString = dates[i];
            const payload = { date: dateString };
            const command = new client_lambda_1.InvokeCommand({
                FunctionName: dailyBackupLambda,
                Payload: Buffer.from(JSON.stringify(payload), 'utf8'),
            });
            tasks.push(() => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const response = yield lambda.send(command);
                    // convert the payload from a Uint8Array to a string
                    const strPayload = Buffer.from(response.Payload.buffer).toString();
                    console.log('Response: ', strPayload);
                    // parse the payload as JSON
                    const responsePayload = JSON.parse(strPayload);
                    const statusCode = responsePayload.statusCode;
                    if (statusCode === 200) {
                        console.log(`Successfully invoked ${dailyBackupLambda} for date ${dateString}`);
                        batchResponse.successDates.push(dateString);
                    }
                    else if (statusCode === 404) {
                        console.log(`No data found for ${dailyBackupLambda} for date ${dateString}`);
                        batchResponse.notFoundDates.push(dateString);
                    }
                    else {
                        // unexpected status code
                        console.log(`Unexpected status code: ${statusCode}`);
                        batchResponse.errorDates.push(dateString);
                    }
                }
                catch (error) {
                    if (error instanceof client_lambda_1.TooManyRequestsException) {
                        console.log(`Failed to invoke ${dailyBackupLambda} for date ${dateString}: TooManyRequestsException`);
                        batchResponse.throttledDates.push(dateString);
                    }
                    else {
                        console.log(`Error invoking ${dailyBackupLambda} with date ${dateString}: ${error}`);
                        batchResponse.errorDates.push(dateString);
                    }
                    return 'error';
                }
            }));
        }
        (0, async_1.parallelLimit)(tasks, 10, (err, data) => {
            if (err) {
                console.error(`Error executing batch tasks: ${err}`);
                resolve([]);
            }
            else {
                resolve(data);
            }
        });
    });
    return batchResponse;
});
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    let totalFailures = 0;
    let strDate = ((_b = event.queryStringParameters) === null || _b === void 0 ? void 0 : _b.date) || ((_c = event === null || event === void 0 ? void 0 : event.body) === null || _c === void 0 ? void 0 : _c.date) || (event === null || event === void 0 ? void 0 : event.date);
    let date;
    if (strDate) {
        date = (0, moment_1.default)(strDate).startOf('day'); // the provided date
    }
    else {
        date = (0, moment_1.default)().subtract(1, 'days').startOf('day'); // yesterday's date
    }
    const totalBatchResults = {
        successDates: [],
        notFoundDates: [],
        throttledDates: [],
        errorDates: [],
    };
    while (totalFailures < 20) {
        const batchDates = [];
        // add 7 dates to the batch in the format YYYY-MM-DD
        for (let i = 0; i < 7; i++) {
            batchDates.push(date.format('YYYY-MM-DD'));
            date = date.subtract(1, 'days');
        }
        const batchResponse = yield batchInvokeLambda(batchDates);
        console.log(`Batch completed with ${batchResponse.successDates.length} successes, 
      ${batchResponse.notFoundDates.length} not found, ${batchResponse.throttledDates.length} throttled and ${batchResponse.errorDates.length} errors`);
        totalBatchResults.successDates.push(...batchResponse.successDates);
        totalBatchResults.notFoundDates.push(...batchResponse.notFoundDates);
        totalBatchResults.throttledDates.push(...batchResponse.throttledDates);
        totalBatchResults.errorDates.push(...batchResponse.errorDates);
        totalFailures = totalFailures + batchResponse.errorDates.length + batchResponse.throttledDates.length + batchResponse.notFoundDates.length;
    }
    if (totalBatchResults.throttledDates.length < 0) {
        // sleep for one second
        yield new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Retrying throttled dates once');
        const retryBatchResponse = yield batchInvokeLambda(totalBatchResults.throttledDates);
        console.log(`Retry batch completed with ${retryBatchResponse.successDates.length} successes, 
      ${retryBatchResponse.notFoundDates.length} not found, ${retryBatchResponse.throttledDates.length} throttled and ${retryBatchResponse.errorDates.length} errors`);
    }
    console.log(`Stopped after receiving ${totalFailures} failures.`);
    return (0, http_utils_1.getHttpResult)(200, 'Success');
});
exports.handler = handler;
