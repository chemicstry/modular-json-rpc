import {Transport} from './Transport';
import {
    ParseRPCMessage,
    RPCMessage,
    RPCRequest,
    RPCResponse,
    RPCResponseError,
    RPCResponseResult,
    JSONParseError,
    InvalidMessageError,
    InvalidRequestError
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
            this.send(new RPCResponseError(req.id, {
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
                this.send(new RPCResponseError(req.id, {
                    code: e.code,
                    message: e.message,
                    data: e.data
                }));
            }
            // Send internal server error
            else {
                this.send(new RPCResponseError(req.id, {
                    code: -32603,
                    message: e.name + ': ' + e.message,
                }));
            }

            return;
        }

        // Do not send result if request was notification
        if (!req.isNotification())
            this.send(new RPCResponseResult(req.id, result));
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

    parseMessage(data: string)
    {
        try {
            var message = ParseRPCMessage(data);
        } catch (e) {
            if (e instanceof JSONParseError) {
                this.send(new RPCResponseError(null, {
                    code: -32700,
                    message: 'Parse error',
                }));
            } else {
                this.send(new RPCResponseError(null, {
                    code: -32600,
                    message: 'Invalid Request',
                }));
            }

            return;
        }

        if (message instanceof RPCRequest)
            this.handleRequest(message);
        else {
            this.send(new RPCResponseError(null, {
                code: -32600,
                message: 'Invalid Request',
            }));
        }
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
