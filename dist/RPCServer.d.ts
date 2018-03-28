import { Transport } from './Transport';
import { RPCMessage, RPCRequest } from './Message';
declare type MethodHandler = (...args: any[]) => any;
interface MethodHandlerMap {
    [index: string]: MethodHandler;
}
declare abstract class RPCServerBase {
    handlers: MethodHandlerMap;
    bind(name: string, handler: MethodHandler): void;
    handleRequest(req: RPCRequest): Promise<void>;
    abstract send(msg: RPCMessage): void;
}
declare class RPCServer extends RPCServerBase {
    private transport;
    constructor(transport: Transport);
    parseMessage(data: string): void;
    send(msg: RPCMessage): void;
}
export { MethodHandler, MethodHandlerMap, RPCServerBase, RPCServer };
