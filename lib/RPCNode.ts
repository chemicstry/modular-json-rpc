import { RequestMap, RPCClientBase } from './RPCClient';
import { MethodHandler, MethodHandlerMap, RPCServerBase } from './RPCServer';
import { Transport } from './Transport';
import {
    ParseRPCMessage,
    RPCMessage,
    RPCRequest,
    RPCResponse,
} from './Message';
import { EventEmitter } from 'events';
import { JSONRPC_TIMEOUT } from './Defines';

// Hack for multiple inheritance
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            }
        });
    }); 
}

class RPCNode extends EventEmitter implements RPCClientBase, RPCServerBase
{
    // RPCClientBase
    requestId: number = 0;
    requests: RequestMap = {};
    requestTimeout: number = JSONRPC_TIMEOUT;
    call: (name: string, ...params: any[]) => Promise<any>;
    notify: (name: string, ...params: any[]) => void;
    handleResponse: (res: RPCResponse) => void;
    // RPCServerBase
    handlers: MethodHandlerMap = {};
    bind: (name: string, handler: MethodHandler) => void;
    handleRequest: (req: RPCRequest) => void;

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
            this.handleRequest(<RPCRequest>message);
    }

    send(msg: RPCMessage): void
    {
        this.transport.SendUpstream(JSON.stringify(msg));
    }
}
applyMixins(RPCNode, [RPCClientBase, RPCServerBase]);

export {
    RPCNode
}
