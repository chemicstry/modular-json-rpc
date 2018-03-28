/// <reference types="node" />
import { Transport } from './Transport';
import { RPCMessage, RPCResponse } from './Message';
import { EventEmitter } from 'events';
interface RequestMap {
    [index: number]: (result: RPCResponse) => void;
}
declare abstract class RPCClientBase extends EventEmitter {
    requestId: number;
    requests: RequestMap;
    requestTimeout: number;
    call(name: string, ...params: any[]): Promise<any>;
    notify(name: string, ...params: any[]): void;
    handleResponse(res: RPCResponse): void;
    abstract send(msg: RPCMessage): void;
}
declare class RPCClient extends RPCClientBase {
    private transport;
    constructor(transport: Transport);
    parseMessage(data: string): void;
    send(msg: RPCMessage): void;
}
export { RequestMap, RPCClientBase, RPCClient };
