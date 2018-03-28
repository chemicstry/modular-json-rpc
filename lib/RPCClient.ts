import {Transport} from './Transport';
import {
    ParseRPCMessage,
    RPCMessage,
    RPCRequest,
    RPCResponse,
    RPCResponseResult,
    RPCResponseError
} from './Message';
import { JSONRPC_TIMEOUT, RPCMethodError } from './Defines';
import { clearTimeout } from 'timers';
import { EventEmitter } from 'events';

interface RequestMap
{
    [index: number]: (result: RPCResponse) => void;
}

// Does not contain transport
abstract class RPCClientBase extends EventEmitter
{
    // Request id autoincrement
    requestId: number = 0;
    // Holds all pending requests
    requests: RequestMap = {};
    // Time in ms to wait for server response
    requestTimeout: number = JSONRPC_TIMEOUT;

    // Calls remote RPC function
    call(name: string, ...params: any[])
    {
        let id = this.requestId++;

        return new Promise((resolve, reject) => {
            // Set timeout
            let timer = setTimeout(() => {
                reject(new Error('Request timed out'));
            }, this.requestTimeout);

            this.requests[id] = (result: RPCResponse) => {
                // Response received, clear timeout
                clearTimeout(timer);

                if (result instanceof RPCResponseResult)
                    resolve(result.result);
                else
                    reject(new RPCMethodError(result.error.code, result.error.message, result.error.data));
            };

            this.send(new RPCRequest(id, name, params));
        });
    }

    notify(name: string, ...params: any[])
    {
        this.send(new RPCRequest(undefined, name, params));
    }

    handleResponse(res: RPCResponse)
    {
        if (typeof res.id !== "number")
        {
            this.emit('error', new Error(`Response id is not a number`));
            return;
        }

        if (!this.requests[res.id])
        {
            this.emit('error', new Error(`Request with id ${res.id} not found`));
            return;
        }
        
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
            this.emit('error', new Error(`Message parse failed: ${e.message}`));
            return;
        }

        if (message.isResponse())
            this.handleResponse(<RPCResponse>message);
        else
            this.emit('error', new Error('Received message of non RPCResponse type'));
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
