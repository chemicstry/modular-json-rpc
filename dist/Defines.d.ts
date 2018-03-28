declare const JSONRPC_VERSION = "2.0";
declare const JSONRPC_TIMEOUT = 5000;
declare class RPCMethodError extends Error {
    code: number;
    message: string;
    data: any;
    constructor(code: number, message: string, data?: any);
}
export { JSONRPC_VERSION, JSONRPC_TIMEOUT, RPCMethodError };
