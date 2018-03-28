/// <reference types="ws" />
import { Transport, TransportCb } from './Transport';
import * as WebSocket from 'ws';
declare class WSTransport implements Transport {
    ws: WebSocket;
    private downstreamCb;
    constructor(ws: WebSocket);
    onReceive(message: string): void;
    SendUpstream(data: string): void;
    SetDownstreamCb(cb: TransportCb): void;
}
export { WSTransport };
