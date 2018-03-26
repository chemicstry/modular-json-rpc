import {Transport} from './Transport';
import {
    ParseRPCMessage,
    RPCMessage,
    RPCRequest,
    RPCResponse
} from './Message';
import { JSONRPC_TIMEOUT, RPCMethodError } from './Defines';
import { clearTimeout } from 'timers';

interface RequestMap
{
    [index: number]: (result: RPCResponse) => void;
}

// Does not contain transport
abstract class RPCClientBase
{
    // Request id autoincrement
    requestId: number = 0;
    // Holds all pending requests
    requests: RequestMap = {};

    // Calls remote RPC function
    call(name: string, ...params: any[])
    {
        let id = this.requestId++;

        this.send(new RPCRequest(id, name, params));

        return new Promise((resolve, reject) => {
            // Set timeout
            let timer = setTimeout(() => {
                reject(new Error('Request timed out'));
            }, JSONRPC_TIMEOUT);

            this.requests[id] = (result: RPCResponse) => {
                // Response received, clear timeout
                clearTimeout(timer);

                if (result.result)
                    resolve(result.result);
                else if (result.error)
                    reject(new RPCMethodError(result.error.code, result.error.message, result.error.data));
                else
                    reject(new Error('Internal RPC error'));
            }
        });
    }

    notify(name: string, ...params: any[])
    {
        this.send(new RPCRequest(undefined, name, params));
    }

    handleResponse(res: RPCResponse)
    {
        if (typeof res.id !== "number")
            return;

        if (!this.requests[res.id])
            console.log(`Request with id ${res.id} not found`);
        
        // Resolve promise
        this.requests[res.id](res);

        // Remove request
        delete this.requests[res.id];
    }

    abstract send(msg: RPCMessage): void;
}

class RPCClient extends RPCClientBase
{
    // Handles communications
    private transport: Transport;

    constructor(transport: Transport) {
        super();
        this.transport = transport;
        this.transport.SetDownstreamCb((data: string) => this.parseMessage(data));
    }

    // Parses received string and handles as request or response
    parseMessage(data: string)
    {
        try {
            var message = ParseRPCMessage(data);
        } catch (e) {
            console.log(e);
            return;
        }

        if (message instanceof RPCResponse)
            this.handleResponse(message);
        else
            console.log("Received unhandled message type");
    }

    send(msg: RPCMessage): void
    {
        this.transport.SendUpstream(JSON.stringify(msg));
    }
}

export {
    RequestMap,
    RPCClientBase,
    RPCClient
};
