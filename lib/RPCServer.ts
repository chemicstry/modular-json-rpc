import {Transport} from './Transport';
import {
    ParseRPCMessage,
    RPCMessage,
    RPCRequest,
    RPCResponse
} from './Message';
import { RPCMethodError } from './Defines';
import { clearTimeout } from 'timers';

declare type MethodHandler = (...args: any[]) => any;

interface MethodHandlerMap
{
    [index: string]: MethodHandler;
}

abstract class RPCServerBase
{
    // Holds all binded server methods
    handlers: MethodHandlerMap = {};

    bind(name: string, handler: MethodHandler)
    {
        this.handlers[name] = handler;
    }

    handleRequest(req: RPCRequest)
    {
        if (this.handlers[req.method] === undefined) {
            this.send(new RPCResponse(req.id, undefined, {
                code: -32601,
                message: 'Method not found'
            }));

            return;
        }


        try {
            // Expand arguments if it is array
            if (req.params instanceof Array)
                var result = this.handlers[req.method](...req.params);
            else
                var result = this.handlers[req.method](req.params);
        } catch (e) {
            // Send a custom error
            if (e instanceof RPCMethodError) {
                this.send(new RPCResponse(req.id, undefined, {
                    code: e.code,
                    message: e.message,
                    data: e.data
                }));
            }
            // Send internal server error
            else {
                this.send(new RPCResponse(req.id, undefined, {
                    code: -32603,
                    message: e,
                }));
            }

            return;
        }

        // Do not send result if request was notification
        if (!req.isNotification())
            this.send(new RPCResponse(req.id, result));
    }

    abstract send(msg: RPCMessage): void;
}

class RPCServer extends RPCServerBase
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

        if (message instanceof RPCRequest)
            this.handleRequest(message);
        else
            console.log("Received unhandled message type");
    }

    send(msg: RPCMessage): void
    {
        this.transport.SendUpstream(JSON.stringify(msg));
    }
}

export {
    MethodHandler,
    MethodHandlerMap,
    RPCServerBase,
    RPCServer
};
