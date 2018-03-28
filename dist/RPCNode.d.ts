/// <reference types="node" />
import { RequestMap, RPCClientBase } from './RPCClient';
import { MethodHandler, MethodHandlerMap, RPCServerBase } from './RPCServer';
import { Transport } from './Transport';
import { RPCMessage, RPCRequest, RPCResponse } from './Message';
import { EventEmitter } from 'events';
declare class RPCNode extends EventEmitter implements RPCClientBase, RPCServerBase {
    requestId: number;
    requests: RequestMap;
    requestTimeout: number;
    call(name: string, ...params: any[]): Promise<{}>;
    notify(name: string, ...params: any[]): void;
    handleResponse(res: RPCResponse): void;
    handlers: MethodHandlerMap;
    bind(name: string, handler: MethodHandler): void;
    handleRequest(req: RPCRequest): void;
    private transport;
    constructor(transport: Transport);
    parseMessage(data: string): void;
    send(msg: RPCMessage): void;
}
export { RPCNode };
