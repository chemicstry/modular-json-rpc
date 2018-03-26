const JSONRPC_VERSION = "2.0";

const JSONRPC_TIMEOUT = 5000;

// Can be throwed from server method to send a custom JSON-RPC error response
class RPCMethodError extends Error {
    code: number;
    message: string;
    data: any;

    constructor(code: number, message: string, data?: any) {
        super(`RPC Method Error. Code: ${code}, message: ${message}`);

        this.code = code;
        this.message = message;
        this.data = data;
    }
}

export {
    JSONRPC_VERSION,
    JSONRPC_TIMEOUT,
    RPCMethodError
}
