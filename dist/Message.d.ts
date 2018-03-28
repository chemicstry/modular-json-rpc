declare type RPCID = string | number | null | undefined;
declare type RPCParams = Array<any> | object;
declare class RPCMessage {
    jsonrpc: string;
    id: RPCID;
    constructor(id: RPCID);
    isRequest(): boolean;
    isResponse(): boolean;
}
declare class RPCError {
    code: number;
    message: string;
    data?: any;
}
declare class RPCRequest extends RPCMessage {
    method: string;
    params?: RPCParams;
    constructor(id: RPCID, method: string, params?: RPCParams);
    isNotification(): boolean;
}
declare class RPCResponseError extends RPCMessage {
    error: RPCError;
    constructor(id: RPCID, error: RPCError);
}
declare class RPCResponseResult extends RPCMessage {
    result: any;
    constructor(id: RPCID, result: any);
}
declare type RPCResponse = RPCResponseError | RPCResponseResult;
declare class JSONParseError extends Error {
    constructor();
}
declare class InvalidMessageError extends Error {
    constructor(e: string);
}
declare class InvalidRequestError extends Error {
    constructor(e: string);
}
declare class InvalidResponseError extends Error {
    constructor(e: string);
}
declare function ParseRPCMessage(msg: string): RPCRequest | RPCResponse;
export { RPCID, RPCParams, RPCMessage, RPCError, RPCResponseError, RPCResponseResult, RPCRequest, RPCResponse, JSONParseError, InvalidMessageError, InvalidRequestError, InvalidResponseError, ParseRPCMessage };
