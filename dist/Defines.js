"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONRPC_VERSION = "2.0";
exports.JSONRPC_VERSION = JSONRPC_VERSION;
const JSONRPC_TIMEOUT = 5000;
exports.JSONRPC_TIMEOUT = JSONRPC_TIMEOUT;
// Can be throwed from server method to send a custom JSON-RPC error response
class RPCMethodError extends Error {
    constructor(code, message, data) {
        super(`RPC Method Error. Code: ${code}, message: ${message}`);
        this.code = code;
        this.message = message;
        this.data = data;
    }
}
exports.RPCMethodError = RPCMethodError;
