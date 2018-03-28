"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Defines_1 = require("./Defines");
// Base JSON-RPC message structure
class RPCMessage {
    constructor(id) {
        this.jsonrpc = Defines_1.JSONRPC_VERSION;
        if (id !== undefined)
            this.id = id;
    }
    isRequest() {
        return (this instanceof RPCRequest);
    }
    isResponse() {
        return (this instanceof RPCResponseError || this instanceof RPCResponseResult);
    }
}
exports.RPCMessage = RPCMessage;
// JSON-RPC error object
class RPCError {
    constructor() {
        this.code = 0;
        this.message = "";
    }
}
exports.RPCError = RPCError;
// JSON-RPC request object
class RPCRequest extends RPCMessage {
    constructor(id, method, params) {
        super(id);
        this.method = method;
        if (params !== undefined)
            this.params = params;
    }
    isNotification() {
        return (this.id === undefined || this.id === null);
    }
}
exports.RPCRequest = RPCRequest;
class RPCResponseError extends RPCMessage {
    constructor(id, error) {
        super(id);
        this.error = error;
    }
}
exports.RPCResponseError = RPCResponseError;
class RPCResponseResult extends RPCMessage {
    constructor(id, result) {
        super(id);
        this.result = result;
    }
}
exports.RPCResponseResult = RPCResponseResult;
// JSON-RPC response object
/*class RPCResponse extends RPCMessage
{
    result?: any;
    error?: RPCError;

    constructor(id: RPCID, result?: any, error?: RPCError)
    {
        super(id);

        if (result && error)
            throw new Error("Result and error can not coexist in RPCResponse");
        else if (result !== undefined)
            this.result = result;
        else if (error !== undefined)
            this.error = error;
        else
            throw new Error("Result or error must exist in RPCResponse");
    }
}*/
class JSONParseError extends Error {
    constructor() {
        super("JSON Parse Error");
    }
}
exports.JSONParseError = JSONParseError;
class InvalidMessageError extends Error {
    constructor(e) {
        super("Invalid Message: " + e);
    }
}
exports.InvalidMessageError = InvalidMessageError;
class InvalidRequestError extends Error {
    constructor(e) {
        super("Invalid Request: " + e);
    }
}
exports.InvalidRequestError = InvalidRequestError;
class InvalidResponseError extends Error {
    constructor(e) {
        super("Invalid Request: " + e);
    }
}
exports.InvalidResponseError = InvalidResponseError;
function ParseRPCMessage(msg) {
    try {
        var data = JSON.parse(msg);
    }
    catch (e) {
        throw new JSONParseError();
    }
    if (data.jsonrpc != Defines_1.JSONRPC_VERSION)
        throw new InvalidMessageError("wrong json rpc version");
    // Request object
    if (data.method) {
        // Method must be a string
        if (typeof data.method !== "string")
            throw new InvalidRequestError("method is not a string");
        return new RPCRequest(data.id, data.method, data.params);
    }
    else if (data.result) {
        if (data.id === undefined)
            throw new InvalidResponseError("id not found");
        return new RPCResponseResult(data.id, data.result);
    }
    else if (data.error) {
        if (typeof data.error.code !== "number")
            throw new InvalidResponseError("error code is not a number");
        if (typeof data.error.message !== "string")
            throw new InvalidResponseError("error message is not a string");
        let error = {
            code: data.error.code,
            message: data.error.message,
        };
        // Data field is optional
        if (data.error.data)
            error.data = data.error.data;
        return new RPCResponseError(data.id, error);
    }
    else
        throw new InvalidMessageError("unknown message type");
}
exports.ParseRPCMessage = ParseRPCMessage;
