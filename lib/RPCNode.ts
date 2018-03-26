import { RequestMap, RPCClientBase } from './RPCClient';
import { MethodHandler, MethodHandlerMap, RPCServerBase } from './RPCServer';
import { Transport } from './Transport';
import {
    ParseRPCMessage,
    RPCMessage,
    RPCRequest,
    RPCResponse,
} from './Message';

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

class RPCNode implements RPCClientBase, RPCServerBase
{
    // RPCClientBase
    requestId: number;
    requests: RequestMap;
    call: (name: string, ...params: any[]) => Promise<any>;
    notify: (name: string, ...params: any[]) => void;
    handleResponse: (res: RPCResponse) => void;
    // RPCServerBase
    handlers: MethodHandlerMap;
    bind: (name: string, handler: MethodHandler) => void;
    handleRequest: (req: RPCRequest) => void;

    // Handles communications
    private transport: Transport;

    constructor(transport: Transport) {
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
        else if (message instanceof RPCRequest)
            this.handleRequest(message);
        else
            console.log("Received unhandled message type");
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
