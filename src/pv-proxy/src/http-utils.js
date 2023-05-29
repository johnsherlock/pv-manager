"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHttpResult = void 0;
const getHttpResult = (statusCode, body) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body,
    };
};
exports.getHttpResult = getHttpResult;
