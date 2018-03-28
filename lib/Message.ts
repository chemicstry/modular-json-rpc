import { JSONRPC_VERSION } from './Defines';

declare type RPCID = string | number | null | undefined;
declare type RPCParams = Array<any> | object;

// Base JSON-RPC message structure
class RPCMessage
{
    jsonrpc: string;
    id: RPCID;

    constructor(id: RPCID)
    {
        this.jsonrpc = JSONRPC_VERSION;

        if (id !== undefined)
            this.id = id;
    }

    isRequest(): boolean
    {
        return (this instanceof RPCRequest);
    }

    isResponse(): boolean
    {
        return (this instanceof RPCResponseError || this instanceof RPCResponseResult);
    }
}

// JSON-RPC error object
class RPCError
{
    code: number;
    message: string;
    data?: any;
}

// JSON-RPC request object
class RPCRequest extends RPCMessage
{
    method: string;
    params?: RPCParams;

    constructor(id: RPCID, method: string, params?: RPCParams)
    {
        super(id);
        this.method = method;

        if (params !== undefined)
            this.params = params;
    }

    isNotification(): boolean
    {
        return (this.id === undefined || this.id === null);
    }
}

class RPCResponseError extends RPCMessage
{
    error: RPCError;

    constructor(id: RPCID, error: RPCError)
    {
        super(id);
        this.error = error;
    }
}

class RPCResponseResult extends RPCMessage
{
    result: any;

    constructor(id: RPCID, result: any)
    {
        super(id);
        this.result = result;
    }
}

type RPCResponse = RPCResponseError | RPCResponseResult;

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

class InvalidMessageError extends Error {
    constructor(e: string) {
        super("Invalid Message: " + e);
    }
}

class InvalidRequestError extends Error {
    constructor(e: string) {
        super("Invalid Request: " + e);
    }
}

class InvalidResponseError extends Error {
    constructor(e: string) {
        super("Invalid Request: " + e);
    }
}

function ParseRPCMessage(msg: string): RPCRequest | RPCResponse
{
    try {
        var data = JSON.parse(msg);
    } catch(e) {
        throw new JSONParseError();
    }

    if (data.jsonrpc != JSONRPC_VERSION)
        throw new InvalidMessageError("wrong json rpc version");

    // Request object
    if (data.method) {
        // Method must be a string
        if (typeof data.method !== "string")
            throw new InvalidRequestError("method is not a string");
        
        return new RPCRequest(data.id, data.method, data.params);
    }
    // Response success object
    else if (data.result) {
        if (data.id === undefined)
            throw new InvalidResponseError("id not found");

        return new RPCResponseResult(data.id, data.result);
    }
    // Response error object
    else if (data.error) {
        if (typeof data.error.code !== "number")
            throw new InvalidResponseError("error code is not a number");

        if (typeof data.error.message !== "string")
            throw new InvalidResponseError("error message is not a string");

        let error: RPCError = {
            code: data.error.code,
            message: data.error.message,
        };

        // Data field is optional
        if (data.error.data)
            error.data = data.error.data;

        return new RPCResponseError(data.id, error);
    }
    // Invalid object
    else
        throw new InvalidMessageError("unknown message type");
}

export {
    RPCID,
    RPCParams,
    RPCMessage,
    RPCError,
    RPCResponseError,
    RPCResponseResult,
    RPCRequest,
    RPCResponse,
    JSONParseError,
    InvalidMessageError,
    InvalidRequestError,
    InvalidResponseError,
    ParseRPCMessage
};
